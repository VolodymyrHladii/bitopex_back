"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appError_1 = tslib_1.__importDefault(require("./appError"));
const catchAsync = (fn) => {
    return (req, res, next) => {
        try {
            fn(req, res, next);
        }
        catch (error) {
            throw new appError_1.default(error.message, 400);
        }
    };
};
exports.default = catchAsync;
//# sourceMappingURL=catchAsync.js.map