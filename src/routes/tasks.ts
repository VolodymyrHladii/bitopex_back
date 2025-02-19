import { Router } from "express";

import { TaskController } from "../controller/task.controller";

const router = Router();

router.post("/claimBonus", TaskController.claimBonus);

router.post("/joinTask", TaskController.joinTask);

router.post("/getTask", TaskController.getTaskDetails);

router.post("/getSponsor", TaskController.getSponsorDetails);

router.post("/getDaily", TaskController.getDailyDetails);

router.post("/getInvite", TaskController.getInviteDetails);

export default router;
