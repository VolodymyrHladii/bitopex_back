"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_API_KEY = exports.config = exports.PORT = void 0;
exports.PORT = process.env.PORT ?? 5001;
exports.config = {
    aws: {
        bucketName: process.env.AWS_BUCKET ?? "",
        region: process.env.AWS_REGION ?? "",
        accessKey: process.env.AWS_ACCESS_KEY ?? "",
        secreteKey: process.env.AWS_SECRET_KEY ?? "",
    },
};
exports.STATIC_API_KEY = process.env.STATIC_API_KEY ?? "";
//# sourceMappingURL=index.js.map