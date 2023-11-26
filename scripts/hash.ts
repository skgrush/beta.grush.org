import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';

export function getFileHash(path: string, algorithm: string) {
  return new Promise<string>((resolve, reject) => {
    const hasher = createHash(algorithm);
    const fileStream = createReadStream(path);

    fileStream.on('data', data => hasher.update(data));
    fileStream.on('end', () => {
      const digest = hasher.digest('hex');
      resolve(digest);
    })
    fileStream.on('error', reject);
  });
}

export enum WalkResultType {
  File = 1,
  Directory = 2,
}

export class WalkResult {
  constructor(
    /** Path relative to the base path */
    readonly key: string,
    readonly filename: string,
    readonly type: WalkResultType,
    readonly checksum: string,
  ) { }
}


export interface IWalkOptions {
  readonly includeDirectories: boolean;
  readonly hashAlgorithm: string;
}

/**
 * Walk directory and subdirectories, depth-first (right?).
 *
 */
export async function* walkDirectory(
  base: string,
  dirRelPath: string,
  options: IWalkOptions,
): AsyncGenerator<WalkResult, undefined, undefined> {

  for await (const fd of await opendir(join(base, dirRelPath))) {
    const entryRelPath = join(dirRelPath, fd.name);

    if (fd.isFile()) {
      const hash = await getFileHash(join(base, entryRelPath), options.hashAlgorithm);
      yield new WalkResult(
        entryRelPath,
        fd.name,
        WalkResultType.File,
        hash,
      );
    } else if (fd.isDirectory()) {
      if (options.includeDirectories) {
        yield new WalkResult(
          entryRelPath,
          fd.name,
          WalkResultType.Directory,
          '',
        );
      }

      yield* walkDirectory(
        base,
        entryRelPath,
        options
      );
    }
  }
}
