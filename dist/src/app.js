"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const cors_1 = tslib_1.__importDefault(require("cors"));
require("dotenv/config");
const express_1 = tslib_1.__importDefault(require("express"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const config_1 = require("./config");
require("./bot");
const changeReferal_controller_1 = require("./controller/changeReferal.controller");
const authenticateUser_1 = tslib_1.__importDefault(require("./heplers/authenticateUser"));
const levelsRecordInitializer_1 = require("./heplers/levelsRecordInitializer");
const routes_1 = tslib_1.__importDefault(require("./routes"));
const admin_1 = tslib_1.__importDefault(require("./routes/admin"));
const staticApi_1 = tslib_1.__importDefault(require("./routes/staticApi"));
const app = (0, express_1.default)();
// const io = new Server(5001);
// io.on("connection", (socket) => {
//   console.log("a user connected", socket);
// });
app.use((0, morgan_1.default)((tokens, req, res) => {
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
}));
app.use("/api/v1", staticApi_1.default);
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json({ limit: "50mb", type: "application/json" }));
app.use((0, cookie_parser_1.default)());
app.use("/api/admin", (0, cors_1.default)(), admin_1.default);
app.get("/api/tonconnect-manifest.json", (0, cors_1.default)(), (_req, res) => {
    const manifest = {
        url: process.env.DOMAIN,
        name: process.env.APP_NAME,
        iconUrl: process.env.DOMAIN + "/airdropMonkey.png",
    };
    res.json(manifest);
});
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        try {
            if (process.env.DEBUG) {
                callback(null, true);
                return;
            }
            if (process.env.DEBUG ?? (new URL(origin ?? "").href === new URL(process.env.DOMAIN ?? "").href || !origin)) {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        }
        catch (error) {
            callback(null, true);
        }
    },
}));
app.use((0, authenticateUser_1.default)(process.env.BOT_TOKEN ?? ""));
app.use("/api", routes_1.default);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-misused-promises
app.post("/api/changeReferal", changeReferal_controller_1.ChangeReferalController.get);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/api/userRequest", changeReferal_controller_1.ChangeReferalController.getUserDetails);
// This middleware will be called when the user requests for the path which is not defined
// app.use("*", (req: Request, _res: Response, next: NextFunction) => {
//   next(new AppError(`Cannot find the path ${req.originalUrl} on this server`, 404));
// });
// app.use(globalErrorHandler);
app.listen(config_1.PORT, () => {
    console.log("Listening to the port no:", config_1.PORT);
});
void levelsRecordInitializer_1.LevelRecordsInitializer.init();
//# sourceMappingURL=app.js.map