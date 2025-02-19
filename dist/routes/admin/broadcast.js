"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const broadcast_controller_1 = require("../../controller/admin/broadcast.controller");
const router = (0, express_1.Router)();
// router.post("/create", BroadCastController.create);
router.post("/get", broadcast_controller_1.BroadCastController.get);
router.post("/cancel", broadcast_controller_1.BroadCastController.cancel);
router.post("/create", broadcast_controller_1.BroadCastController.create);
exports.default = router;
//# sourceMappingURL=broadcast.js.map