export const PORT = process.env.PORT ?? 5001;

export const config = {
  do: {
    bucketName: process.env.DO_BUCKET ?? "",
    region: process.env.DO_REGION ?? "",
    accessKey: process.env.DO_ACCESS_KEY ?? "",
    secreteKey: process.env.DO_SECRET_KEY ?? "",
  },
};

export const STATIC_API_KEY = process.env.STATIC_API_KEY ?? "";
