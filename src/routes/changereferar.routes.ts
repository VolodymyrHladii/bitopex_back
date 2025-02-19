import { type NextFunction, type Request, type Response, Router } from "express";

import { ChangeReferalController } from "../controller/changeReferal.controller";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ChangeReferalController.get(req, res, next);
  } catch (err) {
    console.error("Error in route handler:", err);
    res.status(500).send("Internal server error");
  }
});

export default router;
