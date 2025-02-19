import { type NextFunction, type Request, type Response } from "express";

import { sendSuccessResponseWithoutList } from "../heplers";
import AppError from "../heplers/appError";
import catchAsync from "../heplers/catchAsync";
import { prisma } from "../prisma";

export class DailyRewardController {
  static createDailyReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await prisma.dailyReward.create({
        data: {
          day: req.body.day,
          reward: req.body.reward,
          is_deleted: false,
        },
      });
      return sendSuccessResponseWithoutList(res, result, 200, "Added dailyreward successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static updateDailyReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await prisma.dailyReward.update({
        where: {
          id: req.body.id,
        },
        data: {
          day: req.body.day,
          reward: req.body.reward,
          is_deleted: false,
        },
      });
      return sendSuccessResponseWithoutList(res, result, 200, "Updated dailyreward successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static deleteDailyReward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await prisma.dailyReward.update({
        where: {
          id: req.body.id,
        },
        data: {
          is_deleted: true,
        },
      });
      return sendSuccessResponseWithoutList(res, result, 200, "Deleted dailyreward successfully");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static getDailyRewards = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.$replica().dailyReward.count({
        where: {
          is_deleted: false,
        },
      });
      const task = await prisma.$replica().dailyReward.findMany({
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
      return sendSuccessResponseWithoutList(res, result, 200, "Fetched dailyreward successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });
}
