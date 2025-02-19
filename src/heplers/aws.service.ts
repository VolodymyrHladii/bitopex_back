import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
  },
});

export const signedUrl = async (file: string, ContentType: string) => {
  //   const path = process.env.AWS_PATH ?? "";
  const Bucket: string = process.env.AWS_BUCKET ?? "";
  const region = process.env.AWS_REGION ?? "";
  const Key = `${file}`;

  const command = new PutObjectCommand({ Bucket, Key, ContentType });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  const url = `https://${Bucket}.s3.${region}.amazonaws.com/${Key}`;

  console.log(url);

  return {
    signedUrl,
    key: Key,
    url,
  };
};
