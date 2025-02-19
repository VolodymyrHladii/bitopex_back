import { type NextFunction, type Response } from "express";

import { sendSuccessResponseWithoutList } from "../heplers";
import AppError from "../heplers/appError";
import catchAsync from "../heplers/catchAsync";
import { DOHelper } from "../heplers/do.helper";

export class DOController {
  static fileUpload = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      const uploadedFile = await DOHelper.uploadFile(file.buffer, `bitopex/assets/task-uploads/${Date.now() + "_" + file.originalname}`, {
        ContentType: file.mimetype,
        ContentDisposition: `attachment; filename="${file.originalname}"`,
      });

      return sendSuccessResponseWithoutList(res, uploadedFile, 200, "Successfully uploaded file");
    } catch (err) {
      console.error(err);
      next(new AppError("Something went wrong while uploading file", 400));
    }
  });
}
