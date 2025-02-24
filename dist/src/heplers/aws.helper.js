"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsHelper = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = require("../config");
const Bucket = config_1.config.aws.bucketName;
const region = config_1.config.aws.region;
const client = new client_s3_1.S3Client({
    region,
    credentials: {
        accessKeyId: config_1.config.aws.accessKey,
        secretAccessKey: config_1.config.aws.secreteKey,
    },
});
class AwsHelper {
}
exports.AwsHelper = AwsHelper;
_a = AwsHelper;
AwsHelper.getSignedUrl = async (file, ContentType) => {
    try {
        const Key = `users/${file}`;
        const command = new client_s3_1.PutObjectCommand({ Bucket, Key, ContentType, ACL: "public-read" });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 3600 });
        const url = `https://s3.${region}.amazonaws.com/${Bucket}/${Key}`;
        return {
            signedUrl,
            key: Key,
            url,
        };
    }
    catch (err) {
        console.error("AWS helper.ts getSignedUrl", err);
    }
};
AwsHelper.uploadFile = async (Body, path, options = {}) => {
    try {
        const command = new client_s3_1.PutObjectCommand({
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
    }
    catch (err) {
        console.error("AWS helper.ts uploadFile", err);
    }
};
AwsHelper.deleteFile = async (file) => {
    try {
        const command = new client_s3_1.DeleteObjectCommand({ Bucket, Key: file });
        await client.send(command);
    }
    catch (error) {
        console.error("AWS helper.ts uploadFile", error);
    }
};
//# sourceMappingURL=aws.helper.js.map