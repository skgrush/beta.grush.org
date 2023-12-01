import Ajv, { Schema } from 'ajv';
import { open } from 'node:fs/promises';

const SchemaEnv = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "region",
    "bucket",
    "copySourceRelative",
    "credentials"
  ],
  "properties": {
    "region": {
      "type": "string"
    },
    "bucket": {
      "type": "string"
    },
    "copySourceRelative": {
      "type": "string"
    },
    "credentials": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "accessKeyId",
        "secretAccessKey"
      ],
      "properties": {
        "accessKeyId": {
          "type": "string"
        },
        "secretAccessKey": {
          "type": "string"
        }
      }
    }
  }
} as const satisfies Schema;

const validator = new Ajv().compile(SchemaEnv);

export type IEnv = {
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly region: string;
  readonly bucket: string;
  readonly copySourceRelative: string;
};

export async function getEnvironment(envPath: string) {
  const file = await open(envPath);

  const contents = await file.readFile({ encoding: 'utf8' });
  await file.close();

  const json = JSON.parse(contents);

  if (!validator(json)) {
    throw new Error(`Failed to read ICredentials from ${JSON.stringify(envPath)}`);
  }

  return json;
}
