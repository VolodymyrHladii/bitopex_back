import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.DO_REGION,
  endpoint: `https://${process.env.DO_REGION}.digitaloceanspaces.com`,
  credentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accessKeyId: process.env.DO_ACCESS_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    secretAccessKey: process.env.DO_SECRET_KEY!,
  },
});

export const signedUrl = async (file: string, ContentType: string) => {
  const Bucket: string = process.env.DO_BUCKET ?? "";
  const region = process.env.DO_REGION ?? "";
  const Key = `${file}`;

  const command = new PutObjectCommand({ Bucket, Key, ContentType });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  const url = `https://${Bucket}.${region}.digitaloceanspaces.com/${Key}`;

  console.log(url);

  return {
    signedUrl,
    key: Key,
    url,
  };
};
