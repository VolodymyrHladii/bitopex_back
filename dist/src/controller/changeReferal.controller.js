"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeReferalController = void 0;
const prisma_1 = require("../prisma");
class ChangeReferalController {
}
exports.ChangeReferalController = ChangeReferalController;
_a = ChangeReferalController;
ChangeReferalController.get = async (req, res, _next) => {
    try {
        const page = req.body.page;
        const amount = 0;
        const users = await prisma_1.prisma.$replica().users.findMany({
            where: {
                balance: {
                    gte: 1000,
                },
                // user_id: {
                //   not: 5516936376,
                // },
                is_bonus_taken: false,
            },
            skip: page * 10000,
            take: 10000,
        });
        console.log(users.length);
        console.log("yeah star", users[0].id);
        console.log("end id", users[users.length - 1].id);
        // await prisma.users.updateMany({
        //   where: {
        //     balance: {
        //       $gte: 1000,
        //     },
        //   },
        //   data: {
        //     balance: 0,
        //   },
        // });
        for (let i = 0; i < users.length; i++) {
            console.log("User", i);
            const ifLevelOneExists = await prisma_1.prisma.referals.findFirst({
                where: {
                    user_id_referal: users[i].user_id,
                },
            });
            if (ifLevelOneExists) {
                console.log("Count", i);
                try {
                    await prisma_1.prisma.users.update({
                        where: {
                            user_id: ifLevelOneExists.user_id_referal,
                        },
                        data: {
                            balance: 0,
                        },
                    });
                }
                catch (err) {
                    console.log("err");
                }
            }
        }
        console.log("ended ");
        for (let a = 0; a < users.length; a++) {
            console.log("user count ", a, " user id ", users[a].user_id);
            const levelOneUser = await prisma_1.prisma.$replica().referals.findFirst({
                where: {
                    user_id: users[a].user_id,
                    // user_id_referal: {
                    //   not: "5516936376",
                    // },
                },
            });
            if (levelOneUser) {
                try {
                    await prisma_1.prisma.users.update({
                        where: {
                            user_id: levelOneUser.user_id_referal,
                        },
                        data: {
                            balance: {
                                increment: 400,
                            },
                        },
                    });
                }
                catch (err) {
                    console.log("err at levelOneUser");
                }
                const levelTwoUser = await prisma_1.prisma.$replica().referals.findFirst({
                    where: {
                        user_id: levelOneUser.user_id_referal,
                        // user_id_referal: {
                        //   not: "5516936376",
                        // },
                    },
                });
                if (levelTwoUser) {
                    try {
                        await prisma_1.prisma.users.update({
                            where: {
                                user_id: levelTwoUser.user_id_referal,
                            },
                            data: {
                                balance: {
                                    increment: 150,
                                },
                            },
                        });
                    }
                    catch (err) {
                        console.log("errr at levelTwoUser");
                    }
                    const levelThreeuser = await prisma_1.prisma.$replica().referals.findFirst({
                        where: {
                            user_id: levelTwoUser.user_id_referal,
                            // user_id_referal: {
                            //   not: "5516936376",
                            // },
                        },
                    });
                    if (levelThreeuser) {
                        try {
                            await prisma_1.prisma.users.update({
                                where: {
                                    user_id: levelThreeuser.user_id_referal,
                                },
                                data: {
                                    balance: {
                                        increment: 50,
                                    },
                                },
                            });
                        }
                        catch (err) {
                            console.log("levelThree user");
                        }
                    }
                }
            }
            await prisma_1.prisma.users.update({
                where: {
                    id: users[a].id,
                },
                data: {
                    is_bonus_taken: true,
                },
            });
            // console.log("Done yeah");
        }
        console.log("Completed");
        return res.send(amount.toString());
    }
    catch (err) {
        console.log(err);
    }
};
ChangeReferalController.getUserDetails = async (_req, _res, _next) => {
    try {
        const users = await prisma_1.prisma.$replica().users.findMany({
            where: {
                balance: {
                    gte: 1000,
                },
                // user_id: {
                //   notIn: ["5144847825"],
                // },
                is_bonus_taken: false,
            },
        });
        console.log(users.length);
    }
    catch (err) {
        console.log(err);
    }
};
//# sourceMappingURL=changeReferal.controller.js.map