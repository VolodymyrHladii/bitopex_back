"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadCastController = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-argument */
const client_1 = require("@prisma/client");
const heplers_1 = require("../../heplers");
const appError_1 = tslib_1.__importDefault(require("../../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../../heplers/catchAsync"));
const prisma_1 = require("../../prisma");
class BroadCastController {
}
exports.BroadCastController = BroadCastController;
_a = BroadCastController;
BroadCastController.create = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const result = await prisma_1.prisma.channelMessages.create({
            data: {
                messageFrom: client_1.MessageFrom.Admin,
                content: req.body.content,
                contentType: req.body.type,
                url: req.body.type === client_1.ContentType.Message ? "" : req.body.url,
                status: 0,
                created_at: new Date(),
                // @ts-expect-error error in the type
                channel_post: null,
                message_id: null,
                buttonLink: req.body.buttonLink,
                buttonText: req.body.buttonText,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Your broadcast message in queue.");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
BroadCastController.cancel = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const task = await prisma_1.prisma.channelMessages.update({
            where: {
                id: req.body.id,
            },
            data: {
                status: 2,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Broadcast cancelled successfully.");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
BroadCastController.get = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const limit = req.body.limit ?? 10;
        const skip = req.body.page ?? 1;
        const count = await prisma_1.prisma.channelMessages.count({
            where: {
                messageFrom: client_1.MessageFrom.Admin,
                // is_deleted: false,
                // title: {
                //   contains: req.body.search,
                // },
            },
        });
        const data = await prisma_1.prisma.channelMessages.findMany({
            where: {
                messageFrom: client_1.MessageFrom.Admin,
                // title: {
                //   contains: req.body.search,
                // },
            },
            skip: (skip - 1) * limit,
            take: limit,
            orderBy: { id: "desc" },
        });
        const result = {
            totalCount: count,
            data,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Fetched broadcast successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
//# sourceMappingURL=broadcast.controller.js.map