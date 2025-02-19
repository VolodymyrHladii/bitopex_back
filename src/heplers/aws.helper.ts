import { DeleteObjectCommand, PutObjectCommand, type PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { config } from "../config";

const Bucket = config.aws.bucketName;
const region = config.aws.region;
const client = new S3Client({
  region,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secreteKey,
  },
});

export class AwsHelper {
  static getSignedUrl = async (file: string, ContentType: string) => {
    try {
      const Key = `users/${file}`;
      const command = new PutObjectCommand({ Bucket, Key, ContentType, ACL: "public-read" });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

      const url = `https://s3.${region}.amazonaws.com/${Bucket}/${Key}`;

      return {
        signedUrl,
        key: Key,
        url,
      };
    } catch (err) {
      console.error("AWS helper.ts getSignedUrl", err);
    }
  };

  static uploadFile = async (Body: any, path: string, options: Partial<PutObjectCommandInput> = {}) => {
    try {
      const command = new PutObjectCommand({
        Bucket,
        Key: path,
        Body,
        ACL: "public-read",
        ...(options || {}),
      });

      await client.send(command);
      return {
        url: `https://s3.${region}.amazonaws.com/${Bucket}/${path}`,
        path,
      };
    } catch (err) {
      console.error("AWS helper.ts uploadFile", err);
    }
  };

  static deleteFile = async (file: string) => {
    try {
      const command = new DeleteObjectCommand({ Bucket, Key: file });
      await client.send(command);
    } catch (error) {
      console.error("AWS helper.ts uploadFile", error);
    }
  };
}
