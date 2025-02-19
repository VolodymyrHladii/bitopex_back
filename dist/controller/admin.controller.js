"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tslib_1 = require("tslib");
const bcryptjs_1 = require("bcryptjs");
const heplers_1 = require("../heplers");
const appError_1 = tslib_1.__importStar(require("../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const generateToken_1 = require("../heplers/generateToken");
const prisma_1 = require("../prisma");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
AdminController.login = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // find the user by id
        const admin = await prisma_1.prisma.$replica().admin.findFirst({
            where: {
                email,
            },
        });
        if (!admin) {
            return (0, appError_1.SendErrorResponse)(res, "Admin with the given email does not exist", null, 400, "Error");
        }
        const isPasswordCorrect = await (0, bcryptjs_1.compare)(password, admin.password);
        // check the password
        if (!isPasswordCorrect) {
            return (0, appError_1.SendErrorResponse)(res, "Incorrect Password", null, 400, "Error");
        }
        const token = (0, generateToken_1.generateToken)(admin.id, email);
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, token, 200, "admin logged in successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
AdminController.create = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const salt = (0, bcryptjs_1.genSaltSync)(10);
        const pwd = await (0, bcryptjs_1.hashSync)(req.body.password, salt, function (hash) {
            return hash;
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, pwd, 200, "admin logged in successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
//# sourceMappingURL=admin.controller.js.map