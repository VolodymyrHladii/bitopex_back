"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const dailyReward_1 = tslib_1.__importDefault(require("./dailyReward"));
const educationTasks_1 = tslib_1.__importDefault(require("./educationTasks"));
const tasks_1 = tslib_1.__importDefault(require("./tasks"));
const users_1 = tslib_1.__importDefault(require("./users"));
const router = (0, express_1.Router)();
router.use("/user", users_1.default);
router.use("/task", tasks_1.default);
router.use("/educationTask", educationTasks_1.default);
router.use("/dailyReward", dailyReward_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map