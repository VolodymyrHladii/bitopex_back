"use strict";
// prismaClientInstance.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const extension_read_replicas_1 = require("@prisma/extension-read-replicas");
// let prisma;
// if (process.env.NODE_ENV === "production") {
// prisma = new PrismaClient();
const prisma = new client_1.PrismaClient().$extends((0, extension_read_replicas_1.readReplicas)({
    url: [process.env.DATABASE_READ_URL ?? ""],
}));
exports.prisma = prisma;
//# sourceMappingURL=index.js.map