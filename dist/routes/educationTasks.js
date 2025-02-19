"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eductionTask_controller_1 = require("../controller/eductionTask.controller");
const router = (0, express_1.Router)();
router.post("/claimBonus", eductionTask_controller_1.EductionTaskController.claimBonus);
router.post("/joinTask", eductionTask_controller_1.EductionTaskController.joinTask);
router.post("/getTask", eductionTask_controller_1.EductionTaskController.getTaskDetails);
// router.post("/getSponsor", EductionTaskController.getSponsorDetails);
// router.post("/getDaily", EductionTaskController.getDailyDetails);
// router.post("/getInvite", EductionTaskController.getInviteDetails);
// router.post("/getEducation", EductionTaskController.getEducationDetails);
exports.default = router;
//# sourceMappingURL=educationTasks.js.map