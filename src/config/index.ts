export const PORT = process.env.PORT ?? 5001;

export const config = {
  aws: {
    bucketName: process.env.AWS_BUCKET ?? "",
    region: process.env.AWS_REGION ?? "",
    accessKey: process.env.AWS_ACCESS_KEY ?? "",
    secreteKey: process.env.AWS_SECRET_KEY ?? "",
  },
};

export const STATIC_API_KEY = process.env.STATIC_API_KEY ?? "";
