"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../prisma");
const languages = ["en", "ru", "uk", "de", "zh", "fa", "ar", "es", "hi", "it"];
class UserRepository {
    static async createUser(data) {
        let user = await prisma_1.prisma.$replica().users.findUnique({
            where: {
                user_id: data.user_id,
            },
        });
        if (user) {
            await prisma_1.prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    ...user,
                    language_code: languages?.includes(data?.language_code) ? data.language_code : "en",
                    login: data.login,
                    is_premium: data.is_premium ?? false,
                },
            });
        }
        else {
            user = await prisma_1.prisma.users.create({
                data: {
                    user_id: data.user_id,
                    login: data.login ?? "",
                    language_code: data.language_code,
                    balance: 0,
                    energy: 1000,
                    avatar: data.avatar,
                    date_register: new Date(),
                    auth_token: null,
                    bonus: 0,
                    is_bonus_taken: false,
                    last_energy_updated_at: new Date(),
                    is_premium: data.is_premium ?? false,
                },
            });
            if (data.referal && data.referal !== data.user_id) {
                // const refUser = await prisma.$replica().users.findFirst({
                //   where: {
                //     user_id: data.referal,
                //   },
                // });
                const referal = await prisma_1.prisma.$replica().referals.findFirst({
                    where: {
                        user_id: data.user_id,
                        user_id_referal: data.referal,
                    },
                });
                if (!referal) {
                    await prisma_1.prisma.referals.create({
                        data: {
                            user_id: data.user_id,
                            user_id_referal: data.referal,
                            bonus: data?.is_premium ? 20000 : 10000,
                        },
                    });
                    const bonus = data?.is_premium ? 20000 : 10000;
                    await prisma_1.prisma.users.update({
                        where: {
                            user_id: data.referal,
                        },
                        data: {
                            balance: {
                                increment: bonus,
                            },
                        },
                    });
                }
            }
        }
        return user;
    }
    static async checkUser(userID) {
        const user = await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userID,
            },
        });
        return user ? 1 : 0;
    }
    static async registerRef(userID, referal) {
        await prisma_1.prisma.referals.create({
            data: {
                user_id: userID,
                user_id_referal: referal,
            },
        });
    }
    static async getUserById(userID) {
        return await prisma_1.prisma.$replica().users.findFirst({
            where: {
                user_id: userID,
            },
        });
    }
    static async updateUser(userID, data) {
        await prisma_1.prisma.users.update({
            where: {
                user_id: userID,
            },
            data,
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repositiry.js.map