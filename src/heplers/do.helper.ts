import { PutObjectCommand, type PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";

import { config } from "../config";

const Bucket = config.do.bucketName;
const region = config.do.region;
const endpoint = `https://${region}.digitaloceanspaces.com`;

const client = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId: config.do.accessKey,
    secretAccessKey: config.do.secreteKey,
  },
});

export class DOHelper {
  static uploadFile = async (Body: any, path: string, options: Partial<PutObjectCommandInput> = {}) => {
    try {
      const command = new PutObjectCommand({
        Bucket,
        Key: path,
        Body,
        ACL: "public-read",
        ...options,
      });

      await client.send(command);

      return {
        url: `https://${Bucket}.${region}.digitaloceanspaces.com/${path}`,
        path,
      };
    } catch (err) {
      console.error("DOHelper.ts uploadFile", err);
      throw err;
    }
  };
}
