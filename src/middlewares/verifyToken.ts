import { type NextFunction, type Request, type Response } from "express";
import * as jwt from "jsonwebtoken";

import AppError, { SendErrorResponse } from "../heplers/appError";
import catchAsync from "../heplers/catchAsync";
import { prisma } from "../prisma";

export const verifyJwtToken = catchAsync((req: Request, res: Response, next: NextFunction) => {
  try {
    // Check whether the token is present or not in the request
    const token = req.headers?.authorization?.startsWith("Bearer") ? req.headers.authorization.split(" ")[1] : null;

    if (!token) {
      return SendErrorResponse(res, "Error! You are not authorized to access this API", null, 401, "Error");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY ?? "") as jwt.JwtPayload;

    // Attach id so that the next middleware can have the id to search for the user
    if (decoded.id) {
      next();
    } else {
      return SendErrorResponse(res, "Error! You are not authorized to access this API", null, 401, "Error");
    }
  } catch (error) {
    // next(new AppError((error as Error).message, 401));
    return SendErrorResponse(res, (error as Error).message, "Something went wrong", 401);
  }
});

export const verifyUserAndAttachToRequest = catchAsync(async (req: any, _, next: NextFunction) => {
  const admin = await prisma.$replica().admin.findFirst({
    where: {
      email: req.id.email,
    },
  });

  if (!admin) {
    next(new AppError("The admin with the given email does not exist", 400));
    return;
  }

  req.user = admin;

  next();
});
