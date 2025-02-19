"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelRecordsInitializer = void 0;
const prisma_1 = require("../prisma");
class LevelRecordsInitializer {
    static async init() {
        const levelRecords = await prisma_1.prisma.levels.findMany();
        if (levelRecords.length === 0) {
            const records = [
                { name: "Bronze", boost: 1, boost_balance: 1000, user_balance: 10000, energy: 1000 },
                { name: "Silver", boost: 2, boost_balance: 2000, user_balance: 20000, energy: 1500 },
                { name: "Gold", boost: 3, boost_balance: 4000, user_balance: 30000, energy: 2000 },
                { name: "Platinum", boost: 4, boost_balance: 8000, user_balance: 40000, energy: 2500 },
                { name: "Diamond", boost: 5, boost_balance: 16000, user_balance: 50000, energy: 3000 },
                { name: "Epic", boost: 6, boost_balance: 32000, user_balance: 60000, energy: 3500 },
                { name: "Legendary", boost: 7, boost_balance: 64000, user_balance: 70000, energy: 4000 },
                { name: "Master", boost: 8, boost_balance: 128000, user_balance: 80000, energy: 4500 },
                { name: "GrandMaster", boost: 9, boost_balance: 256000, user_balance: 90000, energy: 5000 },
                { name: "Lord", boost: 10, boost_balance: 514000, user_balance: 100000, energy: 5500 },
            ];
            await prisma_1.prisma.levels.createMany({
                data: records,
            });
        }
    }
}
exports.LevelRecordsInitializer = LevelRecordsInitializer;
//# sourceMappingURL=levelsRecordInitializer.js.map