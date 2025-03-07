"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controller/users.controller");
const router = (0, express_1.Router)();
router.post("/createUser", users_controller_1.UserController.createUser);
router.post("/userById", users_controller_1.UserController.getUserDetails);
router.post("/userReferals", users_controller_1.UserController.userReferals);
router.post("/saveBalance", users_controller_1.UserController.saveUserBalance);
router.post("/updateEnergy", users_controller_1.UserController.updateEnergy);
router.post("/updateFullEnergy", users_controller_1.UserController.updateFullEnergy);
router.post("/updateWallet", users_controller_1.UserController.updateWallet);
router.post("/ranking", users_controller_1.UserController.userList);
router.post("/buyEnergy", users_controller_1.UserController.buyEnergy);
router.post("/buyBoost", users_controller_1.UserController.buyBoost);
router.post("/collectDailyReward", users_controller_1.UserController.collectDailyReward);
router.post("/updateExchangeCoin", users_controller_1.UserController.updateExchangeCoin);
router.post("/updateLanguage", users_controller_1.UserController.updateLanguage);
router.post("/switchSounds", users_controller_1.UserController.switchSounds);
router.post("/deleteAccount", users_controller_1.UserController.deleteAccount);
router.post("/userSeenIntro", users_controller_1.UserController.userSeenIntro);
router.post("/claimAWKToken", users_controller_1.UserController.claimAWKToken);
router.post("/getClaimTokenStatus", users_controller_1.UserController.getClaimTokenStatus);
exports.default = router;
//# sourceMappingURL=users.js.map