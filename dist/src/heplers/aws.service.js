"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION ?? "",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY ?? "",
        secretAccessKey: process.env.AWS_SECRET_KEY ?? "",
    },
});
const signedUrl = async (file, ContentType) => {
    //   const path = process.env.AWS_PATH ?? "";
    const Bucket = process.env.AWS_BUCKET ?? "";
    const region = process.env.AWS_REGION ?? "";
    const Key = `${file}`;
    const command = new client_s3_1.PutObjectCommand({ Bucket, Key, ContentType });
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
    const url = `https://${Bucket}.s3.${region}.amazonaws.com/${Key}`;
    console.log(url);
    return {
        signedUrl,
        key: Key,
        url,
    };
};
exports.signedUrl = signedUrl;
//# sourceMappingURL=aws.service.js.map