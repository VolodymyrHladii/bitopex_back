// routes/staticApi.ts
import { PrismaClient } from "@prisma/client";
import express, { type NextFunction, type Request, type Response } from "express";

import validateStaticKey from "../heplers/validateStaticKey";

const prisma = new PrismaClient();
const router = express.Router();

// Wrapper to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get(
  "/check-user",
  validateStaticKey,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.user_id;

    if (!userId) {
      res.status(400).json({ code: 400, message: "Bad Request: Missing user_id", data: { isMember: false } });
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const user = await prisma.users.findUnique({ where: { user_id: userId.toString() } });

      if (!user) {
        res.json({ code: 200, message: "success", data: { isMember: false } });
      } else {
        res.json({ code: 200, message: "success", data: { isMember: true } });
      }
    } catch (error) {
      res.status(500).json({ code: 500, message: "Internal Server Error", data: { isMember: false } });
    }
  }),
);

export default router;
