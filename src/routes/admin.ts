import { Router } from "express";
import multer, { memoryStorage } from "multer";

import adminBroadcastRouter from "./admin/broadcast";
import { AdminController } from "../controller/admin.controller";
import { DOController } from "../controller/aws.controller";
import { EductionTaskController } from "../controller/eductionTask.controller";
import { TaskController } from "../controller/task.controller";
import { UserController } from "../controller/users.controller";
import { verifyJwtToken } from "../middlewares/verifyToken";

const router = Router();
const upload = multer({ storage: memoryStorage() });

router.post("/login", AdminController.login);

router.post("/task/get", verifyJwtToken, TaskController.getTask);

router.post("/task/create", verifyJwtToken, TaskController.createTask);

router.post("/task/update", verifyJwtToken, TaskController.updateTask);

router.post("/task/delete", verifyJwtToken, TaskController.deleteTask);

router.post("/educationTask/get", verifyJwtToken, EductionTaskController.getTask);

router.post("/educationTask/create", verifyJwtToken, EductionTaskController.createTask);

router.post("/educationTask/update", verifyJwtToken, EductionTaskController.updateTask);

router.post("/educationTask/delete", verifyJwtToken, EductionTaskController.deleteTask);

router.post("/file/upload", upload.single("file"), verifyJwtToken, DOController.fileUpload);

router.post("/user/ranking", verifyJwtToken, UserController.userList);

router.get("/user/count", verifyJwtToken, UserController.userCount);

router.post("/user/getAllClaimTokenStatus", verifyJwtToken, UserController.getAllClaimTokenStatus);

router.post("/user/updateClaimTokenStatus", verifyJwtToken, UserController.updateClaimTokenStatus);

router.get("/user/active-users-in-24-hours", verifyJwtToken, UserController.activeUserInADay);

router.post("/user/registeredUsers", verifyJwtToken, UserController.registeredUsers);

router.use("/broadcast", verifyJwtToken, adminBroadcastRouter);

router.post("/user/getSignedUrl", verifyJwtToken, UserController.getSignedUrl);

export default router;
