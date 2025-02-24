"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserAndAttachToRequest = exports.verifyJwtToken = void 0;
const tslib_1 = require("tslib");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const appError_1 = tslib_1.__importStar(require("../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const prisma_1 = require("../prisma");
exports.verifyJwtToken = (0, catchAsync_1.default)((req, res, next) => {
    try {
        // Check whether the token is present or not in the request
        const token = req.headers?.authorization?.startsWith("Bearer") ? req.headers.authorization.split(" ")[1] : null;
        if (!token) {
            return (0, appError_1.SendErrorResponse)(res, "Error! You are not authorized to access this API", null, 401, "Error");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY ?? "");
        // Attach id so that the next middleware can have the id to search for the user
        if (decoded.id) {
            next();
        }
        else {
            return (0, appError_1.SendErrorResponse)(res, "Error! You are not authorized to access this API", null, 401, "Error");
        }
    }
    catch (error) {
        // next(new AppError((error as Error).message, 401));
        return (0, appError_1.SendErrorResponse)(res, error.message, "Something went wrong", 401);
    }
});
exports.verifyUserAndAttachToRequest = (0, catchAsync_1.default)(async (req, _, next) => {
    const admin = await prisma_1.prisma.$replica().admin.findFirst({
        where: {
            email: req.id.email,
        },
    });
    if (!admin) {
        next(new appError_1.default("The admin with the given email does not exist", 400));
        return;
    }
    req.user = admin;
    next();
});
//# sourceMappingURL=verifyToken.js.map