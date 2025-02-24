"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const generateToken = (id, email) => {
    try {
        return (0, jsonwebtoken_1.sign)({ id, email }, process.env.JWT_SECRET_KEY ?? "", { expiresIn: "1d" });
    }
    catch (e) {
        return null;
    }
};
exports.generateToken = generateToken;
//# sourceMappingURL=generateToken.js.map