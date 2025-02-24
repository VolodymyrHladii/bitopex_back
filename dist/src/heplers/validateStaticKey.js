"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const validateStaticKey = (req, res, next) => {
    const apiKey = req.headers["x-api-key"] ?? req.query.api_key;
    // console.log("KEY", decodeURIComponent(apiKey));
    if (apiKey === config_1.STATIC_API_KEY) {
        next();
    }
    else {
        res.status(403).json({ code: 403, message: "Forbidden: Invalid API Key", data: { isMember: false } });
    }
};
exports.default = validateStaticKey;
//# sourceMappingURL=validateStaticKey.js.map