import { Router } from "express";

import { BroadCastController } from "../../controller/admin/broadcast.controller";
const router = Router();

// router.post("/create", BroadCastController.create);

router.post("/get", BroadCastController.get);

router.post("/cancel", BroadCastController.cancel);

router.post("/create", BroadCastController.create);

export default router;
