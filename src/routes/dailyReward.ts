import { Router } from "express";

import { DailyRewardController } from "../controller/dailyReward.controller";

const router = Router();

router.post("/create", DailyRewardController.createDailyReward);

router.post("/update", DailyRewardController.updateDailyReward);

router.post("/delete", DailyRewardController.deleteDailyReward);

router.post("/list", DailyRewardController.getDailyRewards);

export default router;
