"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyRewardController = void 0;
const tslib_1 = require("tslib");
const heplers_1 = require("../heplers");
const appError_1 = tslib_1.__importDefault(require("../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const prisma_1 = require("../prisma");
class DailyRewardController {
}
exports.DailyRewardController = DailyRewardController;
_a = DailyRewardController;
DailyRewardController.createDailyReward = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const result = await prisma_1.prisma.dailyReward.create({
            data: {
                day: req.body.day,
                reward: req.body.reward,
                is_deleted: false,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Added dailyreward successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
DailyRewardController.updateDailyReward = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const result = await prisma_1.prisma.dailyReward.update({
            where: {
                id: req.body.id,
            },
            data: {
                day: req.body.day,
                reward: req.body.reward,
                is_deleted: false,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Updated dailyreward successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
DailyRewardController.deleteDailyReward = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const result = await prisma_1.prisma.dailyReward.update({
            where: {
                id: req.body.id,
            },
            data: {
                is_deleted: true,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Deleted dailyreward successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
DailyRewardController.getDailyRewards = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const count = await prisma_1.prisma.$replica().dailyReward.count({
            where: {
                is_deleted: false,
            },
        });
        const task = await prisma_1.prisma.$replica().dailyReward.findMany({
            where: {
                is_deleted: false,
            },
            skip: (req.body.page - 1) * req.body.limit,
            take: req.body.limit,
        });
        const result = {
            totalCount: count,
            task,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Fetched dailyreward successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
//# sourceMappingURL=dailyReward.controller.js.map