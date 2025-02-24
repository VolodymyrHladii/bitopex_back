"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tslib_1 = require("tslib");
const geoip_lite_1 = tslib_1.__importDefault(require("geoip-lite"));
// import Web3 from "web3";
const heplers_1 = require("../heplers");
const appError_1 = tslib_1.__importStar(require("../heplers/appError"));
const aws_service_1 = require("../heplers/aws.service");
const catchAsync_1 = tslib_1.__importDefault(require("../heplers/catchAsync"));
const prisma_1 = require("../prisma");
const user_repositiry_1 = require("../repository/user.repositiry");
const levels = [
    { name: "Baby Bull", value: 0 },
    { name: "Youthful Bull", value: 50000 },
    { name: "Young Adult Bull", value: 500000 },
    { name: "Grown Bull", value: 5000000 },
    { name: "Old Bull", value: 35000000 },
    { name: "Wise God Bull", value: 180000000 },
];
const languages = [
    "en",
    "ru",
    "uk",
    "de",
    "hr",
    "tr",
    "pl",
    "ko",
    "hu",
    "zh",
    "fa",
    "ar",
    "id",
    "es",
    "hi",
    "it",
    "sk",
    "fr",
    "ja",
    "vi",
    "sl",
    "cs",
    "pt",
];
class UserController {
    static getIpAddress(xForwarded, xRealIp, reqIp) {
        let clientIp;
        if (xForwarded) {
            const ips = xForwarded.split(",").map((ip) => ip.trim());
            clientIp = ips[0];
        }
        else {
            clientIp = xRealIp || reqIp;
        }
        return clientIp;
    }
}
exports.UserController = UserController;
_a = UserController;
UserController.createUser = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const user = await user_repositiry_1.UserRepository.createUser(req.body);
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, user, 200, "User retrieved successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.userSeenIntro = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                intro_seen: true,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user seen intro successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.getUserDetails = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        let user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        if (user) {
            const currentDate = new Date();
            const currentDateString = currentDate.toISOString().split("T")[0];
            const lastClaimDate = user.last_daily_reward_claimed_at?.toISOString().split("T")[0];
            const lastClaimDate2 = user.last_full_energy_updated_at?.toISOString().split("T")[0];
            let activeDailyReward = user.active_daily_reward ?? 0;
            let isClaimedToday = false;
            let diffDays = 0;
            let diffDaysReward = 0;
            const diffInMs = Math.abs(currentDate.getTime() - new Date(user.last_energy_updated_at).getTime());
            const diffInSeconds = Math.floor(diffInMs / 1000);
            if (lastClaimDate2) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const lastClaimDateObj = new Date(lastClaimDate2);
                const currentDateObj = new Date(currentDateString);
                diffDays = Math.floor((currentDateObj.getTime() - lastClaimDateObj.getTime()) / (1000 * 3600 * 24));
            }
            if (lastClaimDate) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const lastClaimDateObj = new Date(lastClaimDate);
                const currentDateObj = new Date(currentDateString);
                diffDaysReward = Math.floor((currentDateObj.getTime() - lastClaimDateObj.getTime()) / (1000 * 3600 * 24));
                if (diffDaysReward > 1) {
                    activeDailyReward = 0; // Reset to 1 if the user skipped a day
                }
                else {
                    activeDailyReward = activeDailyReward === 10 && diffDaysReward === 1 ? 0 : activeDailyReward;
                }
            }
            else {
                activeDailyReward = 0;
            }
            isClaimedToday = lastClaimDate === currentDateString && activeDailyReward !== 0;
            let countryCode;
            if (!user.countryCode) {
                const ipAddress = _a.getIpAddress(req.headers["x-forwarded-for"], req?.headers["x-real-ip"], req.ip);
                const geo = geoip_lite_1.default.lookup(ipAddress);
                if (geo) {
                    countryCode = geo.country;
                }
            }
            user = await prisma_1.prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    full_energy_available: !user?.last_full_energy_updated_at || diffDays > 0 ? 3 : user.full_energy_available,
                    active_daily_reward: activeDailyReward,
                    language_code: user?.language_code && languages?.includes(user?.language_code) ? user.language_code : "en",
                    user_level_id: user?.user_level_id <= levels?.length - 1 && user?.balance >= levels[user?.user_level_id].value
                        ? user?.user_level_id + 1
                        : user?.user_level_id,
                    boost_level_id: user?.user_level_id <= levels?.length - 1 && user?.balance >= levels[user?.user_level_id].value
                        ? user?.boost_level_id + 1
                        : user?.boost_level_id,
                    energy: Math.min(user.energy + diffInSeconds * 4, (user.energy_level_id + 1) * 500),
                    last_energy_updated_at: new Date(currentDate),
                    countryCode,
                },
            });
            const result = {
                ...user,
                isClaimedToday,
                isNewDay: (!isClaimedToday && diffDaysReward === 1) || activeDailyReward === 0,
            };
            return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "User retrieved successfully");
        }
        else {
            return (0, appError_1.SendErrorResponse)(res, "User not found", null, 500, "Error");
        }
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.userReferals = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const users = await prisma_1.prisma.$replica().referals.findMany({
            where: {
                user_id_referal: userIdFromData,
            },
            skip: req.body.limit * req.body.page,
            take: req.body.limit,
            select: {
                user_id: true,
            },
        });
        const userIds = users.map((data) => data.user_id);
        const userReferals = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
            include: {
                referals: true,
            },
        });
        let referalUserData = [];
        if (users) {
            if (users.length > 0) {
                const referalUser = await prisma_1.prisma.$replica().users.findMany({
                    where: {
                        user_id: {
                            in: userIds,
                        },
                    },
                    select: {
                        login: true,
                        balance: true,
                        bonus: true,
                        user_level_id: true,
                    },
                });
                referalUserData = referalUser;
            }
        }
        const data = {
            referalUserData,
            totalCount: userReferals?.referals.length ?? 0,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, data, 200, "User by referal retrieved successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.saveUserBalance = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const userDetails = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        const amount = req.body.amount;
        if (isNaN(amount)) {
            return (0, appError_1.SendErrorResponse)(res, "Invalid amount", null, 400, "Error");
        }
        const energyReceived = 32;
        if (userDetails) {
            const energy = amount > userDetails.energy ? userDetails.energy : amount;
            const newEnerfy = userDetails.energy - amount + energyReceived;
            const lastEnergy = newEnerfy <= 0 ? 0 : newEnerfy > (userDetails?.energy_level_id + 1) * 500 ? (userDetails?.energy_level_id + 1) * 500 : newEnerfy;
            let userLevel = userDetails?.user_level_id || 1;
            let boostLevel = userDetails?.boost_level_id || 1;
            if (userLevel <= levels?.length - 1) {
                const final = userDetails?.balance + energy;
                if (final >= levels[userLevel].value) {
                    userLevel += 1;
                    boostLevel += 1;
                }
            }
            const user = await prisma_1.prisma.users.update({
                where: {
                    user_id: userIdFromData,
                },
                data: {
                    balance: {
                        increment: Math.abs(energy),
                    },
                    user_level_id: userLevel,
                    boost_level_id: boostLevel,
                    energy: Math.abs(lastEnergy),
                    last_energy_updated_at: new Date(),
                },
            });
            return (0, heplers_1.sendSuccessResponseWithoutList)(res, user, 200, "user balance updated successfully");
        }
        else {
            return (0, appError_1.SendErrorResponse)(res, "User not found", null, 400, "Error");
        }
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateEnergy = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const currentDate = new Date();
        await prisma_1.prisma.$executeRaw `
        UPDATE users
        SET 
          energy = CASE
            WHEN energy + 4 > (energy_level_id+1)*500 THEN (energy_level_id+1)*500
            WHEN energy <0 THEN 0
            ELSE energy + 4
          END,
          last_energy_updated_at = ${currentDate}
        WHERE  user_id = ${userIdFromData};
      `;
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, user, 200, "user energy updated successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateFullEnergy = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const currentDate = new Date();
        const userDetails = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        if (userDetails) {
            if (userDetails?.full_energy_available <= 0) {
                return (0, appError_1.SendErrorResponse)(res, "Full energy not available", null, 400, "Error");
            }
            else {
                const user = await prisma_1.prisma.$executeRaw `
        UPDATE users
        SET 
          energy =  (energy_level_id+1)*500,
          full_energy_available = full_energy_available -1,
          last_full_energy_updated_at = ${currentDate}
        WHERE user_id = ${userIdFromData};
      `;
                return (0, heplers_1.sendSuccessResponseWithoutList)(res, user, 200, "user energy updated successfully");
            }
        }
        else {
            return (0, appError_1.SendErrorResponse)(res, "User not found", null, 400, "Error");
        }
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateWallet = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        const address = req.body.wallet_address;
        if (!address) {
            return (0, appError_1.SendErrorResponse)(res, "Please send wallet address", null, 400, "Error");
        }
        let firstTimeWalletConnectReward = 0;
        if (!user?.wallet_address) {
            firstTimeWalletConnectReward += 5000;
        }
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                wallet_address: address,
                balance: (user?.balance ?? 0) + firstTimeWalletConnectReward,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "User wallet updated successfully");
    }
    catch (error) {
        console.error("wallet error", error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
// static buyBoost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const level = await prisma.levels.findFirst({
//       include: {
//         users: {
//           where: {
//             user_id: req.body.user_id,
//           },
//         },
//       },
//     });
//     console.log("level:", level);
//     let user;
//     if (level && level?.users.length > 0) {
//       const balance = level.users[0].balance;
//       // console.log(level.users[0]);
//       if (balance <= 0) {
//         return SendErrorResponse(res, "You don't have enough balance for boost.", null, 500, "Error");
//       }
//       const basePrice = 1000;
//       // const tap = user.le;
//       const prices = [
//         basePrice,
//         basePrice * 2,
//         basePrice * 4,
//         basePrice * 8,
//         basePrice * 16,
//         basePrice * 32,
//         basePrice * 64,
//         basePrice * 128,
//         basePrice * 256,
//         basePrice * 512,
//       ];
//       if (level.users[0].boost_level_id >= 10) {
//         return sendSuccessResponseWithoutList(res, level, 200, "You are already at maximum level");
//       } else {
//         const price = prices[level.users[0].boost_level_id] || basePrice;
//         if (balance < price) {
//           return SendErrorResponse(res, "You do not have that amount on your balance", null, 500, "Error");
//         }
//         user = await prisma.users.update({
//           where: {
//             user_id: level.users[0].user_id,
//           },
//           data: {
//             boost_level_id: {
//               increment: 1,
//             },
//             balance: level.users[0].balance - price,
//           },
//         });
//       }
//     }
//     return sendSuccessResponseWithoutList(res, user, 200, "fetched user contest list successfully");
//   } catch (error) {
//     next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
//   }
// });
UserController.buyBoost = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        // const currentAmount = req.body.currentAmount;
        const balance = user?.balance ?? 0;
        if (balance <= 0) {
            return (0, appError_1.SendErrorResponse)(res, "You do not have that amount on your balance", null, 500, "Error");
        }
        const basePrice = 1000;
        const prices = [
            basePrice,
            basePrice * 2,
            basePrice * 4,
            basePrice * 8,
            basePrice * 16,
            basePrice * 32,
            basePrice * 64,
            basePrice * 128,
            basePrice * 256,
            basePrice * 512,
        ];
        const price = prices[user?.boost_level_id ?? 1] || basePrice;
        console.log("price -----", price);
        if (balance < price) {
            return (0, appError_1.SendErrorResponse)(res, "You do not have that amount on your balance", null, 500, "Error");
        }
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                boost_level_id: {
                    increment: 1,
                },
                balance: {
                    decrement: price,
                },
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "You have successfully increased your energy.");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
// static buyEnergy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const level = await prisma.levels.findFirst({
//       include: {
//         users: {
//           where: {
//             user_id: req.body.user_id,
//           },
//         },
//       },
//     });
//     let user;
//     if (level && level?.users.length > 0) {
//       const balance = level.users[0].balance;
//       if (balance <= 0) {
//         return SendErrorResponse(res, "You do not have that amount on your balance", null, 500, "Error");
//       }
//       const basePrice = 1000;
//       const prices = [
//         basePrice,
//         basePrice * 2,
//         basePrice * 4,
//         basePrice * 8,
//         basePrice * 16,
//         basePrice * 32,
//         basePrice * 64,
//         basePrice * 128,
//         basePrice * 256,
//         basePrice * 512,
//       ];
//       if (level.users[0].energy_level_id >= 10) {
//         return sendSuccessResponseWithoutList(res, level, 200, "You are already at maximum level");
//       } else {
//         const price = prices[level.users[0].energy_level_id] || basePrice;
//         console.log("price -----", price);
//         if (balance < price) {
//           return SendErrorResponse(res, "You do not have that amount on your balance", null, 500, "Error");
//         }
//         user = await prisma.users.update({
//           where: {
//             user_id: level.users[0].user_id,
//           },
//           data: {
//             energy_level_id: {
//               increment: 1,
//             },
//             balance: balance - price,
//           },
//         });
//       }
//     }
//     return sendSuccessResponseWithoutList(res, user, 200, "You have successfully increased your energy.");
//   } catch (error) {
//     next(new AppError((error as Error).message ?? "Internal Server Error", (error as AppError).status ?? 500));
//   }
// });
UserController.buyEnergy = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        // const currentAmount = req.body.currentAmount;
        const balance = user?.balance ?? 0;
        if (balance <= 0) {
            return (0, appError_1.SendErrorResponse)(res, "You do not have that amount on your balance", null, 500, "Error");
        }
        const basePrice = 1000;
        const prices = [
            basePrice,
            basePrice * 2,
            basePrice * 4,
            basePrice * 8,
            basePrice * 16,
            basePrice * 32,
            basePrice * 64,
            basePrice * 128,
            basePrice * 256,
            basePrice * 512,
        ];
        const price = prices[user?.energy_level_id ?? 1] || basePrice;
        console.log("price -----", price);
        if (balance < price) {
            return (0, appError_1.SendErrorResponse)(res, "You do not have that amount on your balance", null, 500, "Error");
        }
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                energy_level_id: {
                    increment: 1,
                },
                balance: {
                    decrement: price,
                },
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "You have successfully increased your energy.");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.userList = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const countryCode = req.body.filter?.countryCode;
        const sortField = req.body?.sort?.key;
        const sortValue = req.body?.sort?.direction;
        const where = {
            login: {
                contains: req.body.search,
            },
        };
        let orderBy = {
            balance: "desc",
        };
        if (countryCode) {
            where.countryCode = countryCode;
        }
        if (sortField && sortValue) {
            if (sortField === "_count.referals") {
                orderBy = {
                    referals: {
                        _count: sortValue,
                    },
                };
            }
            else {
                orderBy = {
                    [sortField]: sortValue,
                };
            }
        }
        const users = await prisma_1.prisma.$replica().users.findMany({
            where,
            skip: req.body.limit * (req.body.page === 0 ? 0 : req.body.page - 1),
            take: req.body.limit || 100,
            orderBy,
            include: {
                _count: {
                    select: {
                        referals: true,
                    },
                },
            },
        });
        const listOfCountryCode = await prisma_1.prisma.$replica().$queryRaw `SELECT distinct countryCode FROM users where countryCode IS NOT NULL`;
        const totalCount = await prisma_1.prisma.$replica().users.count({ where });
        const result = {
            users,
            totalCount,
            listOfCountryCode,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "fetched user contest list successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.userCount = (0, catchAsync_1.default)(async (_req, res, next) => {
    try {
        const userCount = await prisma_1.prisma.$replica().users.count();
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, userCount, 200, "Fetched User count successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.collectDailyReward = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const dailyRewards = [500, 1000, 1500, 2500, 3000, 4000, 4500, 5000, 6000, 10000];
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split("T")[0];
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userIdFromData,
            },
        });
        if (!user) {
            return (0, appError_1.SendErrorResponse)(res, "User not found", null, 500, "Error");
        }
        const lastClaimDate = user?.last_daily_reward_claimed_at ? user?.last_daily_reward_claimed_at?.toISOString().split("T")[0] : null;
        if (lastClaimDate === currentDateString && user.active_daily_reward !== 0) {
            return (0, appError_1.SendErrorResponse)(res, "Reward already claimed today", null, 500, "Error");
        }
        let activeDailyReward = user.active_daily_reward ?? 1;
        // Check if the user has skipped a day
        if (lastClaimDate) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const lastClaimDateObj = new Date(lastClaimDate);
            const currentDateObj = new Date(currentDateString);
            const differenceInDays = Math.floor((currentDateObj.getTime() - lastClaimDateObj.getTime()) / (1000 * 3600 * 24));
            if (differenceInDays > 1) {
                activeDailyReward = 1; // Reset to 1 if the user skipped a day
            }
            else {
                activeDailyReward = activeDailyReward === 10 ? 1 : activeDailyReward + 1; // Increment or reset to 1 after 10 days
            }
        }
        else {
            activeDailyReward = 1; // If no last claim date, start from 1
        }
        const rewardAmount = dailyRewards[activeDailyReward - 1];
        const result = await prisma_1.prisma.$executeRaw `
        UPDATE users
        SET 
          active_daily_reward = ${activeDailyReward},
          last_daily_reward_claimed_at = ${currentDate},
          balance = balance + ${rewardAmount}
        WHERE user_id = ${userIdFromData};
      `;
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "User daily reward collected successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateExchangeCoin = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        // const user = await prisma.users.findFirst({
        //   where: {
        //     user_id: req.body.user_id,
        //   },
        // });
        const userIdFromData = req.userIdFromData.toString();
        const coin = req.body.exchange_coin;
        if (!coin) {
            return (0, appError_1.SendErrorResponse)(res, "Please provide exchange coin", null, 400, "Error");
        }
        const task = await prisma_1.prisma.$replica().taskDetails.findFirst({
            where: {
                type: "exchange",
                is_deleted: false,
            },
        });
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                exchange_coin: coin,
            },
        });
        if (task) {
            await prisma_1.prisma.tasks.create({
                data: {
                    user_id: userIdFromData,
                    task_id: task.id,
                    is_claimed: false,
                },
            });
        }
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user exchange coin updated successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateLanguage = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const language = req.body.language_code;
        if (!language) {
            return (0, appError_1.SendErrorResponse)(res, "Please provide language code", null, 400, "Error");
        }
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                language_code: languages?.includes(language) ? language : "en",
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user language updated successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.switchSounds = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        const body = req.body;
        console.log(Object.keys(body));
        if (!Object.keys(body).includes("background_sound") && !Object.keys(body).includes("sound_effects")) {
            return (0, appError_1.SendErrorResponse)(res, "Please provide background sound or sound effects", null, 400, "Error");
        }
        const result = await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: body,
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user sound updated successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.deleteAccount = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userIdFromData = req.userIdFromData.toString();
        await prisma_1.prisma.users.update({
            where: {
                user_id: userIdFromData,
            },
            data: {
                balance: 0,
                energy: 1000,
                energy_level_id: 1,
                boost_level_id: 1,
                user_level_id: 1,
                background_sound: true,
                intro_seen: false,
                last_full_energy_updated_at: new Date(),
                last_daily_reward_claimed_at: new Date(),
                active_daily_reward: 0,
                full_energy_available: 6,
                last_energy_updated_at: new Date(),
                language_code: "",
                exchange_coin: "",
                wallet_address: "",
                bonus: 0,
                is_bonus_taken: false,
            },
        });
        await prisma_1.prisma.tasks.deleteMany({
            where: {
                user_id: userIdFromData,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, null, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.claimAWKToken = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userId = req.userIdFromData.toString();
        const isClaimed = await prisma_1.prisma.$replica().airDropUserClaim.findFirst({
            where: { user_id: userId },
        });
        if (isClaimed) {
            next(new appError_1.default("Already claimed. Please wait will token is getting transferred", 400));
            return;
        }
        const response = await prisma_1.prisma.airDropUserClaim.create({
            data: {
                user_id: userId,
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, response, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.getClaimTokenStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const userId = req.userIdFromData.toString();
        const airDropUserClaim = await prisma_1.prisma.$replica().airDropUserClaim.findFirst({
            where: { user_id: userId },
        });
        const isClaimed = airDropUserClaim
            ? airDropUserClaim.is_transaction_complete
                ? "transaction_completed"
                : "transaction_pending"
            : false;
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, { isClaimed }, 200, "claim successfully retrieved");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.getAllClaimTokenStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const airDropUserClaim = await prisma_1.prisma.$replica().airDropUserClaim.findMany({
            skip: req.body.limit * (req.body.page === 0 ? 0 : req.body.page - 1),
            take: req.body.limit || 100,
            orderBy: { created_at: "desc" },
            select: {
                user_id: true,
                is_transaction_complete: true,
                users: {
                    select: {
                        login: true,
                    },
                },
            },
        });
        const totalCount = await prisma_1.prisma.$replica().users.count();
        const result = {
            airDropUserClaim,
            totalCount,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.updateClaimTokenStatus = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const airDropUserClaim = await prisma_1.prisma.airDropUserClaim.update({
            where: {
                user_id: req.body.userId,
            },
            data: {
                is_transaction_complete: req.body.status,
            },
        });
        const totalCount = await prisma_1.prisma.$replica().users.count();
        const result = {
            airDropUserClaim,
            totalCount,
        };
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.activeUserInADay = (0, catchAsync_1.default)(async (_req, res, next) => {
    try {
        const result = await prisma_1.prisma.$replica().users.count({
            where: {
                last_energy_updated_at: {
                    gte: new Date(new Date().setHours(new Date().getHours() - 24)),
                },
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.registeredUsers = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const result = await prisma_1.prisma.$replica().users.count({
            where: {
                date_register: {
                    gte: new Date(startDate).toISOString().slice(0, 10) + "T00:00:00.000Z",
                    lte: new Date(endDate).toISOString().slice(0, 10) + "T00:00:00.000Z",
                },
            },
        });
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, result, 200, "user deleted successfully");
    }
    catch (error) {
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
UserController.getSignedUrl = (0, catchAsync_1.default)(async (req, res, next) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const url = await (0, aws_service_1.signedUrl)(req.body.file, req.body.ContentType);
        return (0, heplers_1.sendSuccessResponseWithoutList)(res, url, 200, "Fetched signed URL");
    }
    catch (error) {
        console.log(error);
        next(new appError_1.default(error.message ?? "Internal Server Error", error.status ?? 500));
    }
});
//# sourceMappingURL=users.controller.js.map