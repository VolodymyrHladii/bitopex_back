"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_API_KEY = exports.config = exports.PORT = void 0;
exports.PORT = process.env.PORT ?? 5001;
exports.config = {
    do: {
        bucketName: process.env.DO_BUCKET ?? "",
        region: process.env.DO_REGION ?? "",
        accessKey: process.env.DO_ACCESS_KEY ?? "",
        secreteKey: process.env.DO_SECRET_KEY ?? "",
    },
};
exports.STATIC_API_KEY = process.env.STATIC_API_KEY ?? "";
//# sourceMappingURL=index.js.map