"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dailyReward_controller_1 = require("../controller/dailyReward.controller");
const router = (0, express_1.Router)();
router.post("/create", dailyReward_controller_1.DailyRewardController.createDailyReward);
router.post("/update", dailyReward_controller_1.DailyRewardController.updateDailyReward);
router.post("/delete", dailyReward_controller_1.DailyRewardController.deleteDailyReward);
router.post("/list", dailyReward_controller_1.DailyRewardController.getDailyRewards);
exports.default = router;
//# sourceMappingURL=dailyReward.js.map