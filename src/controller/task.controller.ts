import { type NextFunction, type Request, type Response } from "express";

import { bot } from "../bot";
import { sendSuccessResponseWithoutList } from "../heplers";
import AppError, { SendErrorResponse } from "../heplers/appError";
import catchAsync from "../heplers/catchAsync";
import { prisma } from "../prisma";

export class TaskController {
  static createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
      const taskToMove = await prisma.taskDetails.findFirst({
        where: { order: req.body.order, is_deleted: false },
      });

      if (taskToMove) {
        return SendErrorResponse(res, "Order already exists, please chose different order number", {}, 400);
      }

      const task = await prisma.taskDetails.create({
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
      return sendSuccessResponseWithoutList(res, task, 200, "Created tasked successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskToMove = await prisma.taskDetails.findUnique({
        where: { id: req.body.id },
      });

      if (!taskToMove) {
        next(new AppError("Task not found", 400));
        return;
      }

      const currentOrder = taskToMove.order;

      if (currentOrder !== req.body.order) {
        // Shift tasks accordingly
        if (currentOrder < req.body.order) {
          // If the task is moving to a higher order, shift other tasks up
          await prisma.taskDetails.updateMany({
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
        } else {
          // If the task is moving to a lower order, shift other tasks down
          await prisma.taskDetails.updateMany({
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

      const task = await prisma.taskDetails.update({
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
      return sendSuccessResponseWithoutList(res, task, 200, "Updated tasked successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await prisma.taskDetails.update({
        where: {
          id: req.body.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return sendSuccessResponseWithoutList(res, task, 200, "Deleted tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getTaskDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      let tasks = await prisma.$replica().taskDetails.findMany({
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

      const parentReferralUser = await prisma.$replica().referals.findFirst({
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

      return sendSuccessResponseWithoutList(res, tasks, 200, "Fetched tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getSponsorDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      const task = await prisma.$replica().taskDetails.findMany({
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
      return sendSuccessResponseWithoutList(res, task, 200, "Fetched tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getDailyDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      const task = await prisma.$replica().taskDetails.findMany({
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
      return sendSuccessResponseWithoutList(res, task, 200, "Fetched tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getInviteDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      const task = await prisma.$replica().taskDetails.findMany({
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
      return sendSuccessResponseWithoutList(res, task, 200, "Fetched tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static joinTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      const user = await prisma.$replica().users.findFirst({
        where: {
          user_id: userIdFromData,
        },
      });
      const taskId: number = req.body.task_id;
      if (isNaN(taskId)) {
        return SendErrorResponse(res, "Task ID is required.", null, 400, "Error");
      }
      const taskDetails = await prisma.$replica().taskDetails.findFirst({
        where: {
          id: taskId,
        },
      });
      if (!taskDetails) {
        return SendErrorResponse(res, "Task not found.", null, 400, "Error");
      }
      if (user) {
        const task = await prisma.$replica().tasks.findFirst({
          where: {
            user_id: user.user_id,
            task_id: taskId,
          },
        });

        if (task) {
          return SendErrorResponse(res, "You have already joined your task.", null, 500, "Error");
        } else {
          if (taskDetails.type === "invite") {
            const count = taskDetails.count ?? 0;
            const userReferals = await prisma.$replica().users.findFirst({
              where: {
                user_id: userIdFromData,
              },
              include: {
                referals: true,
              },
            });

            if ((userReferals?.referals?.length ?? 0) < count) {
              return SendErrorResponse(res, `Invite minimum ${count} friends to claim reward`, null, 400, "Error");
            }
          }
          await prisma.tasks.create({
            data: {
              user_id: user.user_id,
              task_id: taskId,
              is_claimed: false,
            },
          });
        }
      }
      return sendSuccessResponseWithoutList(res, user, 200, "Joined tasked successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static isUserSubscribed = async (userId: string, telegramAccountLink: string) => {
    const telegramAccount = telegramAccountLink.split("t.me/")[1];

    console.log("🚀 ~ TaskController ~ isUserSubscribed= ~ telegramAccount:", telegramAccount);
    const chatIds = ["@" + telegramAccount];
    let response = true;
    for (const chatId of chatIds) {
      try {
        const member = await bot.telegram.getChatMember(chatId, parseInt(userId));
        console.log("MEMBER", member);
        if (member.status !== "member" && member.status !== "creator" && member.status !== "administrator") {
          response = false;
        }
      } catch (error) {
        if (error.code === 400) {
          console.log(`User not found in chat ${chatId}:`, error.description);
        } else {
          console.error(`Error fetching chat member for chat ${chatId}:`, error);
        }
        response = false;
      }
    }
    return response;
  };

  static claimBonus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdFromData = (req as any).userIdFromData.toString();
      const taskId: number = req.body.task_id;
      if (isNaN(taskId)) {
        return SendErrorResponse(res, "Task ID is required.", null, 400, "Error");
      }
      const taskDetails = await prisma.$replica().taskDetails.findFirst({
        where: {
          id: taskId,
        },
      });
      if (!taskDetails) {
        return SendErrorResponse(res, "Task not found.", null, 404, "Error");
      }
      const user = await prisma.$replica().users.findFirst({
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
            return SendErrorResponse(res, "You have already claimed your bonus.", null, 500, "Error");
          } else {
            let isUserSubscribed = true;
            if (taskDetails.performable_action) {
              isUserSubscribed = await this.isUserSubscribed(userIdFromData as string, taskDetails.link);
              console.log("response: ", isUserSubscribed);
            }
            if ((taskDetails.performable_action && isUserSubscribed) || !taskDetails.performable_action) {
              await prisma.tasks.update({
                where: {
                  id: task.id,
                },
                data: {
                  is_claimed: true,
                },
              });
              updatedUser = await prisma.users.update({
                where: {
                  id: user.id,
                },
                data: {
                  balance: {
                    increment: taskDetails.bonus,
                  },
                },
              });
              return sendSuccessResponseWithoutList(res, updatedUser, 200, "Completed tasked successfully");
            } else {
              await prisma.tasks.delete({
                where: {
                  id: task.id,
                },
              });
              return SendErrorResponse(res, "Please subscribe the channel to avail bonus.", null, 400, "Error");
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
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skip: number = req.body.page ?? 1;
      const limit: number = req.body.limit ?? 100;
      const category: string = req.body.type ?? undefined;

      const count = await prisma.$replica().taskDetails.count({
        where: {
          is_deleted: false,
          type: category,
        },
      });
      const task = await prisma.$replica().taskDetails.findMany({
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
      return sendSuccessResponseWithoutList(res, result, 200, "Fetched tasked successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });
}
