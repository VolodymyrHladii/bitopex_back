"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendErrorResponse = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.status = statusCode;
        this.statusMessage = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
const SendErrorResponse = (res, message, data, status = 400, statusText = "Error") => {
    return res.status(status).json({
        success: false,
        message,
        data,
        statusText,
    });
};
exports.SendErrorResponse = SendErrorResponse;
exports.default = AppError;
//# sourceMappingURL=appError.js.map