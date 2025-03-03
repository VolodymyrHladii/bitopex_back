"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const multer_1 = tslib_1.__importStar(require("multer"));
const broadcast_1 = tslib_1.__importDefault(require("./admin/broadcast"));
const admin_controller_1 = require("../controller/admin.controller");
const aws_controller_1 = require("../controller/aws.controller");
const eductionTask_controller_1 = require("../controller/eductionTask.controller");
const task_controller_1 = require("../controller/task.controller");
const users_controller_1 = require("../controller/users.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: (0, multer_1.memoryStorage)() });
router.post("/login", admin_controller_1.AdminController.login);
router.post("/task/get", verifyToken_1.verifyJwtToken, task_controller_1.TaskController.getTask);
router.post("/task/create", verifyToken_1.verifyJwtToken, task_controller_1.TaskController.createTask);
router.post("/task/update", verifyToken_1.verifyJwtToken, task_controller_1.TaskController.updateTask);
router.post("/task/delete", verifyToken_1.verifyJwtToken, task_controller_1.TaskController.deleteTask);
router.post("/educationTask/get", verifyToken_1.verifyJwtToken, eductionTask_controller_1.EductionTaskController.getTask);
router.post("/educationTask/create", verifyToken_1.verifyJwtToken, eductionTask_controller_1.EductionTaskController.createTask);
router.post("/educationTask/update", verifyToken_1.verifyJwtToken, eductionTask_controller_1.EductionTaskController.updateTask);
router.post("/educationTask/delete", verifyToken_1.verifyJwtToken, eductionTask_controller_1.EductionTaskController.deleteTask);
router.post("/file/upload", upload.single("file"), verifyToken_1.verifyJwtToken, aws_controller_1.DOController.fileUpload);
router.post("/user/ranking", verifyToken_1.verifyJwtToken, users_controller_1.UserController.userList);
router.get("/user/count", verifyToken_1.verifyJwtToken, users_controller_1.UserController.userCount);
router.post("/user/getAllClaimTokenStatus", verifyToken_1.verifyJwtToken, users_controller_1.UserController.getAllClaimTokenStatus);
router.post("/user/updateClaimTokenStatus", verifyToken_1.verifyJwtToken, users_controller_1.UserController.updateClaimTokenStatus);
router.get("/user/active-users-in-24-hours", verifyToken_1.verifyJwtToken, users_controller_1.UserController.activeUserInADay);
router.post("/user/registeredUsers", verifyToken_1.verifyJwtToken, users_controller_1.UserController.registeredUsers);
router.use("/broadcast", verifyToken_1.verifyJwtToken, broadcast_1.default);
router.post("/user/getSignedUrl", verifyToken_1.verifyJwtToken, users_controller_1.UserController.getSignedUrl);
exports.default = router;
//# sourceMappingURL=admin.js.map