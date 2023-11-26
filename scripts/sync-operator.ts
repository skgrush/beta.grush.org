import { DeleteObjectCommand, DeleteObjectCommandOutput, PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { CompareType, ComparedItem } from "./compare-s3.js";
import { IMigrateMetadata, IMigrateObjectMetadata } from "./metadata.interface";
import { createReadStream } from "node:fs";
import { join } from "node:path";

export enum SyncResult {
  Error = 0,
  Success = 1,
  Noop = 2,
}

export class SyncOperator {

  #runs = 0;
  #errors = new Map<ComparedItem, unknown[]>();

  get runCount() {
    return this.#runs;
  }
  get hasErrors() {
    return !!this.#errors.size;
  }

  constructor(
    readonly operatorId: string,
    readonly comparedItemMap: Map<string, ComparedItem>,
    readonly bucket: string,
    readonly client: S3Client,
    readonly metadata: IMigrateMetadata,
    readonly basePath: string,
    readonly force: boolean,
  ) { }

  *getLatestErrors() {
    for (const [item, errors] of this.#errors) {
      yield {
        item,
        error: errors[errors.length - 1],
      };
    }
  }

  async runSync() {
    if (this.#runs) {
      console.error('Attempting to run operator', this.operatorId, 'again, rather than retry(); likely in error');
    }
    this.#runs++;

    const results: SyncResult[] = [];

    // loop until there are no more comparedItemMap items
    while (true) {
      const keyIterResult = this.comparedItemMap.keys().next();
      if (keyIterResult.done) {
        // no more keys, we're done!
        break;
      }
      const key = keyIterResult.value;
      const item = this.comparedItemMap.get(key);
      if (!item || !this.comparedItemMap.delete(key)) {
        // the item isn't in the map or was deleted before we expected; continue
        continue;
      }

      // we have exclusive ownership of the item
      const result = await this.#executeTransfer(item);
      results.push(result);
    }

    return {
      operator: this,
      results,
    };
  }

  async retry() {
    ++this.#runs;

    const results: SyncResult[] = [];

    for (const item of this.#errors.keys()) {
      const result = await this.#executeTransfer(item);
      if (result) {
        this.#errors.delete(item);
      }
      results.push(result);
    }

    return {
      operator: this,
      results,
    };
  }

  async #executeTransfer(item: ComparedItem) {
    if (item.type === CompareType.NoChange && !this.force) {
      return SyncResult.Noop;
    }

    const key = item.key;
    const metadata = this.metadata[key];

    let result: PutObjectCommandOutput | DeleteObjectCommandOutput | null;

    if (
      (item.type === CompareType.NewLocally || item.type === CompareType.Changed) ||
      (item.type === CompareType.NoChange && this.force)
    ) {
      result = await this.#put(item, metadata);
    } else if (item.type === CompareType.RemovedLocally) {
      result = await this.#delete(item);
    } else {
      throw new Error(`Unexpected CompareType value: ${item.type}`);
    }

    return !!result
      ? SyncResult.Success
      : SyncResult.Error;
  }

  async #put(item: ComparedItem, metadata: IMigrateObjectMetadata | undefined) {
    try {
      const local = item.localObject!;
      const fullPath = join(this.basePath, local.key);
      const fileStream = createReadStream(fullPath);

      // ContentMD5 is b64 while ETag is MD5 (though it may not be MD5 if uploaded via multi)
      const b64md5 = Buffer.from(local.checksum, 'hex').toString('base64');

      const command = new PutObjectCommand({
        ...metadata,
        Bucket: this.bucket,
        Key: local.key,
        ContentMD5: b64md5,
        ContentType: local.mime,
        Body: fileStream,
      });

      const result = await this.client.send(command);
      return result;
    } catch (e) {
      this.#addError(item, e);

      return null;
    }
  }

  async #delete(item: ComparedItem) {
    try {
      const s3Object = item.s3Object;

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: item.key,
      });

      const result = await this.client.send(command);
      return result;
    } catch (e) {
      this.#addError(item, e);

      return null;
    }
  }

  #addError(item: ComparedItem, error: unknown) {
    const existingErrors = this.#errors.get(item) ?? [];
    if (!existingErrors.length) {
      this.#errors.set(item, existingErrors)
    }
    existingErrors.push(error);
  }
}
