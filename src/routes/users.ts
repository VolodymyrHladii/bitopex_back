import { Router } from "express";

import { UserController } from "../controller/users.controller";

const router = Router();

router.post("/createUser", UserController.createUser);
router.post("/userById", UserController.getUserDetails);
router.post("/userReferals", UserController.userReferals);
router.post("/saveBalance", UserController.saveUserBalance);
router.post("/updateEnergy", UserController.updateEnergy);
router.post("/updateFullEnergy", UserController.updateFullEnergy);
router.post("/updateWallet", UserController.updateWallet);
router.post("/ranking", UserController.userList);
router.post("/buyEnergy", UserController.buyEnergy);
router.post("/buyBoost", UserController.buyBoost);
router.post("/collectDailyReward", UserController.collectDailyReward);
router.post("/updateExchangeCoin", UserController.updateExchangeCoin);
router.post("/updateLanguage", UserController.updateLanguage);
router.post("/switchSounds", UserController.switchSounds);
router.post("/deleteAccount", UserController.deleteAccount);
router.post("/userSeenIntro", UserController.userSeenIntro);
router.post("/claimAWKToken", UserController.claimAWKToken);
router.post("/getClaimTokenStatus", UserController.getClaimTokenStatus);

export default router;
