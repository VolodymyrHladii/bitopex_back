// prismaClientInstance.ts

import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

// let prisma;

// if (process.env.NODE_ENV === "production") {
// prisma = new PrismaClient();
const prisma = new PrismaClient().$extends(
  readReplicas({
    url: [process.env.DATABASE_READ_URL ?? ""],
  }),
);
// } else {
//   console.log("first replicas");
//   if (!(global as any).prisma) {
//     (global as any).prisma = new PrismaClient();
//   }
//   prisma = (global as any).prisma;
// }

export { prisma };
