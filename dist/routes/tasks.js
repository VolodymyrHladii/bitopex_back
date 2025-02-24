"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controller/task.controller");
const router = (0, express_1.Router)();
router.post("/claimBonus", task_controller_1.TaskController.claimBonus);
router.post("/joinTask", task_controller_1.TaskController.joinTask);
router.post("/getTask", task_controller_1.TaskController.getTaskDetails);
router.post("/getSponsor", task_controller_1.TaskController.getSponsorDetails);
router.post("/getDaily", task_controller_1.TaskController.getDailyDetails);
router.post("/getInvite", task_controller_1.TaskController.getInviteDetails);
exports.default = router;
//# sourceMappingURL=tasks.js.map