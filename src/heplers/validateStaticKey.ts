import { type NextFunction, type Request, type Response } from "express";

import { STATIC_API_KEY } from "../config";

const validateStaticKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers["x-api-key"] ?? req.query.api_key;
  // console.log("KEY", decodeURIComponent(apiKey));
  if (apiKey === STATIC_API_KEY) {
    next();
  } else {
    res.status(403).json({ code: 403, message: "Forbidden: Invalid API Key", data: { isMember: false } });
  }
};

export default validateStaticKey;
