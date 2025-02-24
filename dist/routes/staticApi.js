"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// routes/staticApi.ts
const client_1 = require("@prisma/client");
const express_1 = tslib_1.__importDefault(require("express"));
const validateStaticKey_1 = tslib_1.__importDefault(require("../heplers/validateStaticKey"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
router.get("/check-user", validateStaticKey_1.default, asyncHandler(async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) {
        res.status(400).json({ code: 400, message: "Bad Request: Missing user_id", data: { isMember: false } });
        return;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const user = await prisma.users.findUnique({ where: { user_id: userId.toString() } });
        if (!user) {
            res.json({ code: 200, message: "success", data: { isMember: false } });
        }
        else {
            res.json({ code: 200, message: "success", data: { isMember: true } });
        }
    }
    catch (error) {
        res.status(500).json({ code: 500, message: "Internal Server Error", data: { isMember: false } });
    }
}));
exports.default = router;
//# sourceMappingURL=staticApi.js.map