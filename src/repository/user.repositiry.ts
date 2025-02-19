import { prisma } from "../prisma";

const languages = ["en", "ru", "uk", "de", "zh", "fa", "ar", "es", "hi", "it"];
export class UserRepository {
  static async createUser(data) {
    let user = await prisma.$replica().users.findUnique({
      where: {
        user_id: data.user_id,
      },
    });
    if (user) {
      await prisma.users.update({
        where: {
          id: user.id,
        },
        data: {
          ...user,
          language_code: languages?.includes(data?.language_code as string) ? data.language_code : "en",
          login: data.login,
          is_premium: data.is_premium ?? false,
        },
      });
    } else {
      user = await prisma.users.create({
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
        const referal = await prisma.$replica().referals.findFirst({
          where: {
            user_id: data.user_id,
            user_id_referal: data.referal,
          },
        });
        if (!referal) {
          await prisma.referals.create({
            data: {
              user_id: data.user_id,
              user_id_referal: data.referal,
              bonus: data?.is_premium ? 20000 : 10000,
            },
          });
          const bonus = data?.is_premium ? 20000 : 10000;
          await prisma.users.update({
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

  static async checkUser(userID: string): Promise<number> {
    const user = await prisma.$replica().users.findFirst({
      where: {
        user_id: userID,
      },
    });
    return user ? 1 : 0;
  }

  static async registerRef(userID: string, referal: string): Promise<void> {
    await prisma.referals.create({
      data: {
        user_id: userID,
        user_id_referal: referal,
      },
    });
  }

  static async getUserById(userID: string) {
    return await prisma.$replica().users.findFirst({
      where: {
        user_id: userID,
      },
    });
  }

  static async updateUser(userID: string, data: any): Promise<void> {
    await prisma.users.update({
      where: {
        user_id: userID,
      },
      data,
    });
  }
}
