import { S3Client } from '@aws-sdk/client-s3';
import { join, normalize } from 'node:path';
import { open } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFromBucket } from './s3.js';
import { walkDirectory } from './hash.js';
import { CompareType, ComparedItem, compareS3 } from './compare-s3.js';
import { IMigrateMetadata } from './metadata.interface';
import minimist from 'minimist';
import { SyncOperator, SyncResult } from './sync-operator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRootPath = normalize(join(__dirname, '../'));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}

interface ICredentials {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}

interface IEnv {
  readonly credentials: ICredentials;
  readonly region: string;
  readonly bucket: string;
  readonly copySourceRelative: string;
}

async function main() {

  const {
    execute: argExecute,
    concurrency: argConcurrency,
    force: argForce,
  } = minimist(process.argv.slice(2));

  const env = await getEnvironment();
  const client = await getClient(env);

  const bucketContents = await readFromBucket(env.bucket, client);

  const basePathAbs = normalize(join(__dirname, env.copySourceRelative));
  const walkIter = walkDirectory(
    basePathAbs,
    '',
    {
      hashAlgorithm: 'md5',
      includeDirectories: false,
    },
  );

  const allComparisons = await compareS3(bucketContents, walkIter);

  console.group('Comparisons:');
  for (const [key, val] of allComparisons) {
    console.info(key, ':', CompareType[val.type], val.localObject?.mime);
  }
  console.groupEnd();

  const metadatas = await getMetadata();
  console.group('Metadatas:');
  console.info(JSON.stringify(metadatas, undefined, 2));


  if (!argExecute) {
    console.warn('Missing --execute, stopping.');
    return;
  }

  let concurrency = 4;
  if (argConcurrency !== undefined) {
    concurrency = argConcurrency;
    if (typeof concurrency !== 'number' || concurrency < 1) {
      throw new TypeError('argv concurrency must be a number > 1');
    }
  } else {
    console.warn('Missing --concurrency, defaulting to', concurrency);
  }

  if (argForce) {
    console.warn('--force provided; NoChange files will be uploaded');
  }
  const comparisonFilter: (kv: [key: string, value: ComparedItem]) => boolean = argForce
    ? kv => true
    : ([k, v]) => v.type !== CompareType.NoChange;
  const todoComparisons = new Map([...allComparisons].filter(comparisonFilter));

  const totalSize = [...todoComparisons.values()].reduce((prev, curr) => prev + (curr.localObject?.size ?? 0), 0);

  const operators = Array(concurrency).fill(null).map((_, idx) => new SyncOperator(
    idx.toString(),
    todoComparisons,
    env.bucket,
    client,
    metadatas,
    basePathAbs,
    argForce,
  ));

  const runs = await Promise.all(operators.map(op => op.runSync()));

  const failedRuns = runs.filter(run => run.results.some(r => r === SyncResult.Error));
  if (failedRuns.length === 0) {
    console.info('Success!');
    for (const run of runs) {
      console.info('Operator', run.operator.operatorId, ':', run.results.filter(r => r === SyncResult.Success).length, 'successes,', run.results.filter(r => r === SyncResult.Noop).length, 'noops');
    }
    return true;
  }

  if (failedRuns) {
    console.error('\n\n\nSome operators failed:', failedRuns.length, '/', operators.length, 'failed');
    for (const run of failedRuns) {
      console.error('============================');
      console.error('Operator', run.operator.operatorId, ':', run.results.filter(r => r === SyncResult.Error).length, '/', run.results.length);

      for (const { item, error } of run.operator.getLatestErrors()) {
        console.error('=========================');
        console.error('Item:', item);
        console.error(error);
      }
    }
  }
}

async function getClient(env: IEnv) {
  const {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    }
  } = env;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}


async function getEnvironment(): Promise<IEnv> {
  const path = join(repoRootPath, 'scripts/.env.json');
  const file = await open(path);

  const contents = await file.readFile({ encoding: 'utf8' });

  const json = JSON.parse(contents) as IEnv;
  if (
    typeof json.credentials === 'object' &&
    typeof json.credentials.accessKeyId === 'string' &&
    typeof json.credentials.secretAccessKey === 'string' &&
    typeof json.region === 'string' &&
    typeof json.bucket === 'string' &&
    typeof json.copySourceRelative === 'string'
  ) {
    return json;
  }

  throw new Error(`Failed to read ICredentials from ${JSON.stringify(path)}`);
}

async function getMetadata(): Promise<IMigrateMetadata> {
  const path = join(repoRootPath, 'scripts/metadata.json');
  const file = await open(path);

  const contents = await file.readFile({ encoding: 'utf8' });

  return JSON.parse(contents);
}
