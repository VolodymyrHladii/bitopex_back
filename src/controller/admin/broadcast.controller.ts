/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ContentType, MessageFrom } from "@prisma/client";
import { type NextFunction, type Request, type Response } from "express";

import { sendSuccessResponseWithoutList } from "../../heplers";
import AppError from "../../heplers/appError";
import catchAsync from "../../heplers/catchAsync";
import { prisma } from "../../prisma";

export class BroadCastController {
  static create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await prisma.channelMessages.create({
        data: {
          messageFrom: MessageFrom.Admin,
          content: req.body.content,
          contentType: req.body.type,
          url: req.body.type === ContentType.Message ? "" : req.body.url,
          status: 0,
          created_at: new Date(),
          // @ts-expect-error error in the type
          channel_post: null,
          message_id: null,
          buttonLink: req.body.buttonLink,
          buttonText: req.body.buttonText,
        },
      });
      return sendSuccessResponseWithoutList(res, result, 200, "Your broadcast message in queue.");
    } catch (error) {
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static cancel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await prisma.channelMessages.update({
        where: {
          id: req.body.id,
        },
        data: {
          status: 2,
        },
      });
      return sendSuccessResponseWithoutList(res, task, 200, "Broadcast cancelled successfully.");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static get = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.body.limit ?? 10;
      const skip = req.body.page ?? 1;
      const count = await prisma.channelMessages.count({
        where: {
          messageFrom: MessageFrom.Admin,
          // is_deleted: false,
          // title: {
          //   contains: req.body.search,
          // },
        },
      });
      const data = await prisma.channelMessages.findMany({
        where: {
          messageFrom: MessageFrom.Admin,
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
      return sendSuccessResponseWithoutList(res, result, 200, "Fetched broadcast successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });
}
