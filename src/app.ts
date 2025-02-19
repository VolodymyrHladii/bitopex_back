import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { type Application } from "express";
import morgan from "morgan";

import { PORT } from "./config";
import "./bot";
import { ChangeReferalController } from "./controller/changeReferal.controller";
import authenticateUser from "./heplers/authenticateUser";
import { LevelRecordsInitializer } from "./heplers/levelsRecordInitializer";
import router from "./routes";
import adminRoutes from "./routes/admin";
import staticRoutes from "./routes/staticApi";
const app: Application = express();
// const io = new Server(5001);

// io.on("connection", (socket) => {
//   console.log("a user connected", socket);
// });

app.use(
  morgan((tokens, req, res) => {
    // Skip logging for OPTIONS requests
    if (req.method === "OPTIONS") {
      return null;
    }

    // Otherwise, use the default combined format
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  }),
);

app.use("/api/v1", staticRoutes);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(cookieParser());
app.use("/api/admin", cors(), adminRoutes);
app.get("/api/tonconnect-manifest.json", cors(), (_req, res) => {
  const manifest = {
    url: process.env.DOMAIN,
    name: process.env.APP_NAME,
    iconUrl: process.env.DOMAIN + "/airdropMonkey.png",
  };
  res.json(manifest);
});

app.use(
  cors({
    origin: function (origin, callback) {
      try {
        if (process.env.DEBUG) {
          callback(null, true);
          return;
        }
        if (process.env.DEBUG ?? (new URL(origin ?? "").href === new URL(process.env.DOMAIN ?? "").href || !origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } catch (error) {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.use(authenticateUser(process.env.BOT_TOKEN ?? ""));

app.use("/api", router);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises
app.post("/api/changeReferal", ChangeReferalController.get);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/api/userRequest", ChangeReferalController.getUserDetails);

// This middleware will be called when the user requests for the path which is not defined
// app.use("*", (req: Request, _res: Response, next: NextFunction) => {
//   next(new AppError(`Cannot find the path ${req.originalUrl} on this server`, 404));
// });

// app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log("Listening to the port no:", PORT);
});

void LevelRecordsInitializer.init();
