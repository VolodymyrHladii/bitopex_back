"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOController = void 0;
const tslib_1 = require("tslib");
const heplers_1 = require("../heplers");
const appError_1 = tslib_1.__importDefault(require("../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const do_helper_1 = require("../heplers/do.helper");
class DOController {
}
exports.DOController = DOController;
_a = DOController;
DOController.fileUpload = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const file = req.file;
        const uploadedFile = await do_helper_1.DOHelper.uploadFile(file.buffer, `bitopex/assets/task-uploads/${Date.now() + "_" + file.originalname}`, {
            ContentType: file.mimetype,
            ContentDisposition: `attachment; filename="${file.originalname}"`,
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, uploadedFile, 200, "Successfully uploaded file");
    }
    catch (err) {
        console.error(err);
        next(new appError_1.default("Something went wrong while uploading file", 400));
    }
});
//# sourceMappingURL=aws.controller.js.map