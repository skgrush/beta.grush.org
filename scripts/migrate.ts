import { S3Client } from '@aws-sdk/client-s3';
import { join, normalize } from 'node:path';
import { open } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFromBucket } from './s3.js';
import { WalkResult, walkDirectory } from './hash.js';

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

  const env = await getEnvironment();

  const client = await getClient(env);

  const bucketContents = await readFromBucket(env.bucket, client);
  console.info('bucketContents', bucketContents);

  const copySourceAbs = normalize(join(__dirname, env.copySourceRelative));
  const walkIter = walkDirectory(
    copySourceAbs,
    '',
    {
      hashAlgorithm: 'md5',
      includeDirectories: false,
    },
  );
  const walkResults: WalkResult[] = [];
  for await (const walkItem of walkIter) {
    walkResults.push(walkItem);
  }

  console.info('walkResults', walkResults);
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

