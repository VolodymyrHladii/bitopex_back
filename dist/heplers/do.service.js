"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({
    region: process.env.DO_REGION,
    endpoint: `https://${process.env.DO_REGION}.digitaloceanspaces.com`,
    credentials: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accessKeyId: process.env.DO_ACCESS_KEY,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        secretAccessKey: process.env.DO_SECRET_KEY,
    },
});
const signedUrl = async (file, ContentType) => {
    const Bucket = process.env.DO_BUCKET ?? "";
    const region = process.env.DO_REGION ?? "";
    const Key = `${file}`;
    const command = new client_s3_1.PutObjectCommand({ Bucket, Key, ContentType });
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
    const url = `https://${Bucket}.${region}.digitaloceanspaces.com/${Key}`;
    console.log(url);
    return {
        signedUrl,
        key: Key,
        url,
    };
};
exports.signedUrl = signedUrl;
//# sourceMappingURL=do.service.js.map