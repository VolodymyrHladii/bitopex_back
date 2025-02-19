import { compare, genSaltSync, hashSync } from "bcryptjs";
import { type NextFunction, type Request, type Response } from "express";

import { sendSuccessResponseWithoutList } from "../heplers";
import AppError, { SendErrorResponse } from "../heplers/appError";
import catchAsync from "../heplers/catchAsync";
import { generateToken } from "../heplers/generateToken";
import { prisma } from "../prisma";

export class AdminController {
  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // find the user by id
      const admin = await prisma.$replica().admin.findFirst({
        where: {
          email,
        },
      });

      if (!admin) {
        return SendErrorResponse(res, "Admin with the given email does not exist", null, 400, "Error");
      }

      const isPasswordCorrect = await compare(password, admin.password);

      // check the password
      if (!isPasswordCorrect) {
        return SendErrorResponse(res, "Incorrect Password", null, 400, "Error");
      }

      const token = generateToken(admin.id, email);
      return sendSuccessResponseWithoutList(res, token, 200, "admin logged in successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });

  static create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const salt = genSaltSync(10);
      const pwd = await hashSync(req.body.password, salt, function (hash) {
        return hash;
      });

      return sendSuccessResponseWithoutList(res, pwd, 200, "admin logged in successfully");
    } catch (error) {
      console.log(error);
      next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
    }
  });
}
