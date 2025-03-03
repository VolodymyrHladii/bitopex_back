"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOHelper = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../config");
const Bucket = config_1.config.do.bucketName;
const region = config_1.config.do.region;
const endpoint = `https://${region}.digitaloceanspaces.com`;
const client = new client_s3_1.S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: config_1.config.do.accessKey,
        secretAccessKey: config_1.config.do.secreteKey,
    },
});
class DOHelper {
}
exports.DOHelper = DOHelper;
_a = DOHelper;
DOHelper.uploadFile = async (Body, path, options = {}) => {
    try {
        const command = new client_s3_1.PutObjectCommand({
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
    }
    catch (err) {
        console.error("DOHelper.ts uploadFile", err);
        throw err;
    }
};
//# sourceMappingURL=do.helper.js.map