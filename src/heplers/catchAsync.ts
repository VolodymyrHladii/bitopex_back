import { type NextFunction, type Request, type Response } from "express";

import AppError from "./appError";

const catchAsync = (fn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next);
    } catch (error) {
      throw new AppError((error as Error).message, 400);
    }
  };
};

export default catchAsync;
