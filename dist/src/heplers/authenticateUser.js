"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const authenticateUser = (botToken) => {
    return (req, res, next) => {
        const { initData } = req.query;
        const userId = req.query?.userId?.toString() ?? "";
        const timestamp = req.query?.t?.toString() ?? Infinity;
        // below calculation is static on backend & frontend
        // This verify if request time is within 60sec or not
        const isValid = new Date().valueOf() - ((Number(timestamp) - 13284) / 2) * 12 < 60000;
        if (!initData || !userId || !isValid) {
            return res.status(400).json({ error: "Unauthorized" });
        }
        const dataCheckArr = decodeURIComponent(initData).split("&");
        let userIdFromData = null;
        // Extract user data and user id
        for (const item of dataCheckArr) {
            if (item.startsWith("user=")) {
                const jsonStr = decodeURIComponent(item.substring(5));
                const userData = JSON.parse(jsonStr);
                userIdFromData = userData.id;
                break;
            }
        }
        if (userId !== userIdFromData?.toString()) {
            return res.status(400).json({ error: "User ID does not match" });
            // return res.status(400).json({ error: "Try after some time!" });
        }
        let checkHash = null;
        for (let i = 0; i < dataCheckArr.length; i++) {
            if (dataCheckArr[i].startsWith("hash=")) {
                checkHash = dataCheckArr[i].substring(5);
                dataCheckArr[i] = "";
            }
        }
        const filteredDataCheckArr = dataCheckArr.filter((val) => val !== "");
        filteredDataCheckArr.sort();
        const dataCheckString = filteredDataCheckArr.join("\n");
        const secretKey = crypto_1.default.createHmac("sha256", "WebAppData").update(botToken).digest();
        const hash = crypto_1.default.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
        if (hash === checkHash) {
            req.userIdFromData = userIdFromData;
            next();
        }
        else {
            res.status(400).json({ error: "Invalid hash" });
        }
    };
};
exports.default = authenticateUser;
//# sourceMappingURL=authenticateUser.js.map