import crypto from "crypto";

import { type NextFunction, type Request, type Response } from "express";

const authenticateUser = (botToken: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { initData } = req.query;

    const userId = req.query?.userId?.toString() ?? "";
    const timestamp = req.query?.t?.toString() ?? Infinity;
    // below calculation is static on backend & frontend
    // This verify if request time is within 60sec or not
    const isValid = new Date().valueOf() - ((Number(timestamp) - 13284) / 2) * 12 < 60000;

    if (!initData || !userId || !isValid) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const dataCheckArr = decodeURIComponent(initData as string).split("&");

    let userIdFromData: string | null = null;

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

    let checkHash: string | null = null;

    for (let i = 0; i < dataCheckArr.length; i++) {
      if (dataCheckArr[i].startsWith("hash=")) {
        checkHash = dataCheckArr[i].substring(5);
        dataCheckArr[i] = "";
      }
    }

    const filteredDataCheckArr = dataCheckArr.filter((val) => val !== "");
    filteredDataCheckArr.sort();
    const dataCheckString = filteredDataCheckArr.join("\n");

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (hash !== checkHash) {
      (req as any).userIdFromData = userIdFromData;
      next();
    } else {
      res.status(400).json({ error: "Invalid hash" });
    }
  };
};

export default authenticateUser;
