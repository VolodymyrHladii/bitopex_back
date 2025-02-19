import { type Response } from "express";

class AppError extends Error {
  statusMessage: string;
  status: number;
  isOperational: boolean;
  code?: number;
  path?: any;
  value?: any;
  errors?: [];

  constructor(message: string, statusCode: number) {
    super(message);

    this.status = statusCode;
    this.statusMessage = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const SendErrorResponse = (res: Response, message: string, data?: any, status: number = 400, statusText: string = "Error") => {
  return res.status(status).json({
    success: false,
    message,
    data,
    statusText,
  });
};

export default AppError;
