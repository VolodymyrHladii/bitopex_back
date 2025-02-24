"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const tslib_1 = require("tslib");
const bot_1 = require("../bot");
const heplers_1 = require("../heplers");
const appError_1 = tslib_1.__importStar(require("../heplers/appError"));
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const prisma_1 = require("../prisma");
class TaskController {
}
exports.TaskController = TaskController;
_a = TaskController;
TaskController.createTask = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        // const data: object = {
        //   title: req.body.title,
        //   link: req.body.link,
        //   bonus: req.body.bonus,
        //   image: req?.body?.image || "",
        //   type: req?.body?.type || "link",
        // };
        // if (req.body.count) {
        //   if (!isNaN(req.body.count)) {
        //     return SendErrorResponse(res, "Invalid count", null, 400, "Error");
        //   } else {
        //     data.count = req.body.count;
        //   }
        // }
        const taskToMove = await prisma_1.prisma.taskDetails.findFirst({
            where: { order: req.body.order, is_deleted: false },
        });
        if (taskToMove) {
            return (0, appError_1.SendErrorResponse)(res, "Order already exists, please chose different order number", {}, 400);
        }
        const task = await prisma_1.prisma.taskDetails.create({
            data: {
                title: req.body.title,
                link: req.body.link,
                bonus: req.body.bonus,
                image: req?.body?.image || "",
                type: req?.body?.type || "link",
                count: req?.body?.count || null,
                performable_action: req?.body?.performableAction || "",
                order: req.body?.order || 0,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Created tasked successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.updateTask = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const taskToMove = await prisma_1.prisma.taskDetails.findUnique({
            where: { id: req.body.id },
        });
        if (!taskToMove) {
            next(new appError_1.default("Task not found", 400));
            return;
        }
        const currentOrder = taskToMove.order;
        if (currentOrder !== req.body.order) {
            // Shift tasks accordingly
            if (currentOrder < req.body.order) {
                // If the task is moving to a higher order, shift other tasks up
                await prisma_1.prisma.taskDetails.updateMany({
                    where: {
                        order: {
                            gt: currentOrder, // Greater than current order
                            lte: req.body.order, // Less than or equal to new order
                        },
                        is_deleted: false,
                    },
                    data: {
                        order: { decrement: 1 }, // Decrease order by 1
                    },
                });
            }
            else {
                // If the task is moving to a lower order, shift other tasks down
                await prisma_1.prisma.taskDetails.updateMany({
                    where: {
                        order: {
                            gte: req.body.order, // Greater than or equal to new order
                            lt: currentOrder, // Less than current order
                        },
                        is_deleted: false,
                    },
                    data: {
                        order: { increment: 1 }, // Increase order by 1
                    },
                });
            }
        }
        const task = await prisma_1.prisma.taskDetails.update({
            where: {
                id: req.body.id,
            },
            data: {
                title: req.body.title,
                link: req.body.link,
                bonus: req.body.bonus,
                image: req?.body?.image || "",
                type: req?.body?.type || "link",
                count: req?.body?.count || null,
                performable_action: req?.body?.performableAction || "",
                order: req.body?.order,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Updated tasked successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.deleteTask = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const task = await prisma_1.prisma.taskDetails.update({
            where: {
                id: req.body.id,
            },
            data: {
                is_deleted: true,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Deleted tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.getTaskDetails = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        let tasks = await prisma_1.prisma.$replica().taskDetails.findMany({
            where: {
                is_deleted: false,
                type: "link",
            },
            include: {
                task: {
                    where: {
                        user_id: userIdFromData,
                    },
                },
            },
            orderBy: {
                order: "asc",
            },
        });
        const parentReferralUser = await prisma_1.prisma.$replica().referals.findFirst({
            where: { user_id: userIdFromData },
            select: { users: { select: { login: true } } },
        });
        /**
         * This is set as per client request. This replace "register on Bitopex" task to below link for specific user
         */
        if (parentReferralUser?.users?.login === "defimastercap") {
            tasks = tasks.map((task) => {
                if (task.title === "Register on Bitopex") {
                    return { ...task, link: "https://bitopex.io/register-telegram?ref=7ebb2719d9b5" };
                }
                return task;
            });
        }
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, tasks, 200, "Fetched tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.getSponsorDetails = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const task = await prisma_1.prisma.$replica().taskDetails.findMany({
            where: {
                is_deleted: false,
                type: "sponsor",
            },
            include: {
                task: {
                    where: {
                        user_id: userIdFromData,
                    },
                },
            },
            orderBy: {
                order: "asc",
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Fetched tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.getDailyDetails = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const task = await prisma_1.prisma.$replica().taskDetails.findMany({
            where: {
                is_deleted: false,
                type: "daily",
            },
            include: {
                task: {
                    where: {
                        user_id: userIdFromData,
                    },
                },
            },
            orderBy: {
                order: "asc",
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Fetched tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.getInviteDetails = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const task = await prisma_1.prisma.$replica().taskDetails.findMany({
            where: {
                is_deleted: false,
                type: "invite",
            },
            include: {
                task: {
                    where: {
                        user_id: userIdFromData,
                    },
                },
            },
            orderBy: {
                order: "asc",
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, task, 200, "Fetched tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.joinTask = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        const taskId = req.body.task_id;
        if (isNaN(taskId)) {
            return (0, appError_1.SendErrorResponse)(res, "Task ID is required.", null, 400, "Error");
        }
        const taskDetails = await prisma_1.prisma.$replica().taskDetails.findFirst({
            where: {
                id: taskId,
            },
        });
        if (!taskDetails) {
            return (0, appError_1.SendErrorResponse)(res, "Task not found.", null, 400, "Error");
        }
        if (user) {
            const task = await prisma_1.prisma.$replica().tasks.findFirst({
                where: {
                    user_id: user.user_id,
                    task_id: taskId,
                },
            });
            if (task) {
                return (0, appError_1.SendErrorResponse)(res, "You have already joined your task.", null, 500, "Error");
            }
            else {
                if (taskDetails.type === "invite") {
                    const count = taskDetails.count ?? 0;
                    const userReferals = await prisma_1.prisma.$replica().users.findFirst({
                        where: {
                            user_id: userIdFromData,
                        },
                        include: {
                            referals: true,
                        },
                    });
                    if ((userReferals?.referals?.length ?? 0) < count) {
                        return (0, appError_1.SendErrorResponse)(res, `Invite minimum ${count} friends to claim reward`, null, 400, "Error");
                    }
                }
                await prisma_1.prisma.tasks.create({
                    data: {
                        user_id: user.user_id,
                        task_id: taskId,
                        is_claimed: false,
                    },
                });
            }
        }
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, user, 200, "Joined tasked successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.isUserSubscribed = async (userId, telegramAccountLink) => {
    const telegramAccount = telegramAccountLink.split("t.me/")[1];
    console.log("🚀 ~ TaskController ~ isUserSubscribed= ~ telegramAccount:", telegramAccount);
    const chatIds = ["@" + telegramAccount];
    let response = true;
    for (const chatId of chatIds) {
        try {
            const member = await bot_1.bot.telegram.getChatMember(chatId, parseInt(userId));
            console.log("MEMBER", member);
            if (member.status !== "member" && member.status !== "creator" && member.status !== "administrator") {
                response = false;
            }
        }
        catch (error) {
            if (error.code === 400) {
                console.log(`User not found in chat ${chatId}:`, error.description);
            }
            else {
                console.error(`Error fetching chat member for chat ${chatId}:`, error);
            }
            response = false;
        }
    }
    return response;
};
TaskController.claimBonus = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const taskId = req.body.task_id;
        if (isNaN(taskId)) {
            return (0, appError_1.SendErrorResponse)(res, "Task ID is required.", null, 400, "Error");
        }
        const taskDetails = await prisma_1.prisma.$replica().taskDetails.findFirst({
            where: {
                id: taskId,
            },
        });
        if (!taskDetails) {
            return (0, appError_1.SendErrorResponse)(res, "Task not found.", null, 404, "Error");
        }
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
            include: {
                tasks: {
                    where: {
                        task_id: req.body.task_id,
                    },
                },
            },
        });
        let updatedUser;
        if (user) {
            const task = user.tasks[0];
            console.log("task: ", task);
            if (task) {
                if (task.is_claimed) {
                    return (0, appError_1.SendErrorResponse)(res, "You have already claimed your bonus.", null, 500, "Error");
                }
                else {
                    let isUserSubscribed = true;
                    if (taskDetails.performable_action) {
                        isUserSubscribed = await _a.isUserSubscribed(userIdFromData, taskDetails.link);
                        console.log("response: ", isUserSubscribed);
                    }
                    if ((taskDetails.performable_action && isUserSubscribed) || !taskDetails.performable_action) {
                        await prisma_1.prisma.tasks.update({
                            where: {
                                id: task.id,
                            },
                            data: {
                                is_claimed: true,
                            },
                        });
                        updatedUser = await prisma_1.prisma.users.update({
                            where: {
                                id: user.id,
                            },
                            data: {
                                balance: {
                                    increment: taskDetails.bonus,
                                },
                            },
                        });
                        return (0, heplers_1.sendSuccessResponseWithoutList)(res, updatedUser, 200, "Completed tasked successfully");
                    }
                    else {
                        await prisma_1.prisma.tasks.delete({
                            where: {
                                id: task.id,
                            },
                        });
                        return (0, appError_1.SendErrorResponse)(res, "Please subscribe the channel to avail bonus.", null, 400, "Error");
                    }
                    // if (user && user.balance >= 1000 && !user.is_bonus_taken) {
                    //   const bonusLevels = [
                    //     { increment: 400, userKey: "user_id" },
                    //     { increment: 150, userKey: "user_id_referal" },
                    //     { increment: 50, userKey: "user_id_referal" },
                    //   ];
                    //   let currentUserId = user.user_id;
                    //   for (const level of bonusLevels) {
                    //     try {
                    //       const referral = await prisma.referals.findFirst({
                    //         where: { user_id: currentUserId },
                    //       });
                    //       if (!referral) break;
                    //       try {
                    //         await prisma.users.update({
                    //           where: { user_id: referral.user_id_referal },
                    //           data: {
                    //             bonus: { increment: level.increment },
                    //             balance: { increment: level.increment },
                    //           },
                    //         });
                    //         currentUserId = referral.user_id_referal;
                    //       } catch (err) {
                    //         console.log("update error");
                    //       }
                    //     } catch (err) {
                    //       console.log("find referal err");
                    //     }
                    //   }
                    //   // Mark the bonus as taken
                    //   await prisma.users.update({
                    //     where: { id: user.id },
                    //     data: { is_bonus_taken: true },
                    //   });
                    // }
                }
            }
        }
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
TaskController.getTask = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const skip = req.body.page ?? 1;
        const limit = req.body.limit ?? 100;
        const category = req.body.type ?? undefined;
        const count = await prisma_1.prisma.$replica().taskDetails.count({
            where: {
                is_deleted: false,
                type: category,
            },
        });
        const task = await prisma_1.prisma.$replica().taskDetails.findMany({
            where: {
                is_deleted: false,
                type: category,
            },
            skip: (skip - 1) * limit,
            take: limit,
            orderBy: {
                order: "asc",
            },
        });
        const result = {
            totalCount: count,
            task,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "Fetched tasked successfully");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
//# sourceMappingURL=task.controller.js.map