import { Router } from "express";

import dailyRewardRouter from "./dailyReward";
import educationTaskRouter from "./educationTasks";
import taskRouter from "./tasks";
import userRouter from "./users";
const router = Router();

router.use("/user", userRouter);
router.use("/task", taskRouter);
router.use("/educationTask", educationTaskRouter);
router.use("/dailyReward", dailyRewardRouter);

export default router;
