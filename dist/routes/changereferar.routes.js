"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const changeReferal_controller_1 = require("../controller/changeReferal.controller");
const router = (0, express_1.Router)();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", async (req, res, next) => {
    try {
        await changeReferal_controller_1.ChangeReferalController.get(req, res, next);
    }
    catch (err) {
        console.error("Error in route handler:", err);
        res.status(500).send("Internal server error");
    }
});
exports.default = router;
//# sourceMappingURL=changereferar.routes.js.map