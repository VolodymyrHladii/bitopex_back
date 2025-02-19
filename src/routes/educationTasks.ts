import { Router } from "express";

import { EductionTaskController } from "../controller/eductionTask.controller";

const router = Router();

router.post("/claimBonus", EductionTaskController.claimBonus);

router.post("/joinTask", EductionTaskController.joinTask);

router.post("/getTask", EductionTaskController.getTaskDetails);

// router.post("/getSponsor", EductionTaskController.getSponsorDetails);

// router.post("/getDaily", EductionTaskController.getDailyDetails);

// router.post("/getInvite", EductionTaskController.getInviteDetails);

// router.post("/getEducation", EductionTaskController.getEducationDetails);

export default router;
