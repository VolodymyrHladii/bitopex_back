"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const telegraf_1 = require("telegraf");
const heplers_1 = require("./heplers");
const user_repositiry_1 = require("./repository/user.repositiry");
// import { UserRepository } from "./repository/user.repository";
exports.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN ?? "");
// Cron job to process pending messages every minutes
node_cron_1.default.schedule("* * * * *", async () => {
    await (0, heplers_1.processPendingMessages)(exports.bot);
});
const webLink = process.env.DOMAIN ?? "";
// const subscribeLink = process.env.BOT_LINK ?? "";
const groupLink = process.env.GROUP_LINK ?? "";
const channelLink = process.env.CHANNEL_LINK ?? "";
async function getUserProfilePhoto(ctx) {
    const user = ctx.from;
    if (!user)
        return null;
    const photos = await ctx.telegram.getUserProfilePhotos(user.id);
    if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const file = await ctx.telegram.getFileLink(fileId);
        return file.href;
    }
    return null;
}
const imagePath = path_1.default.resolve(__dirname, "launch.webp");
exports.bot.catch((err, ctx) => {
    if (err.code === 403 && err.description === "Forbidden: bot was blocked by the user") {
        const chatId = ctx.update.message?.chat.id;
        if (chatId) {
            console.log(`Bot was blocked by user ${chatId}`);
            // Optionally, handle the event, such as logging or removing user from your database
        }
    }
    else {
        const chatId = ctx.update.message?.chat.id;
        if (chatId) {
            console.error(`Error for user ${chatId}:`, err);
        }
        else {
            console.error("Error:", err);
        }
    }
});
// async function isUserSubscribed(ctx, userId) {
//   if (process.env.DEBUG === "true") return true;
//   const chatIds = [
//     "@bitOpexchannel",
//     // "@BitOpexIO"
//   ];
//   for (const chatId of chatIds) {
//     console.log("chatId", chatId);
//     try {
//       const member = await ctx.telegram.getChatMember(chatId, userId);
//       console.log("MEMBER", member);
//       if (member.status !== "member" && member.status !== "creator" && member.status !== "administrator") {
//         return false;
//       }
//     } catch (error) {
//       if (error.code === 400) {
//         console.log(`User not found in chat ${chatId}:`, error.description);
//       } else {
//         console.error(`Error fetching chat member for chat ${chatId}:`, error);
//       }
//       return false;
//     }
//   }
//   return true;
// }
// const subscriptionMarkup = Markup.inlineKeyboard([
//   [Markup.button.url("🔊 Bitopex | Channel", channelLink)],
//   // [Markup.button.url("🔊 Bitopex | Group", groupLink)],
//   [Markup.button.callback("✅ I subscribed", "check_sub")],
// ]);
exports.bot.start(async (ctx) => {
    try {
        const user = ctx.from;
        const referredBy = ctx.message?.text.split(" ")[1];
        const profilePhotoUrl = await getUserProfilePhoto(ctx);
        console.log(user);
        const data = {
            login: user?.username ?? user?.first_name ?? "",
            language_code: user?.language_code ?? "",
            avtar: profilePhotoUrl,
            user_id: user?.id.toString() ?? "",
            referal: referredBy ?? "",
            is_premium: user?.is_premium ?? false,
        };
        await user_repositiry_1.UserRepository.createUser(data);
        // if (await isUserSubscribed(ctx, user.id)) {
        await ctx.replyWithPhoto({ source: imagePath }, {
            caption: `🚀 We're excited to introduce you to the simplest way to trade crypto options. To make learning fun and rewarding, we've launched a Telegram education tap game where you can collect points by tapping and learning about crypto options. The more points you collect the more you receive from the exclusive airdrop! Plus, our Bitopex token is gearing up to launch on the TON network.Join us now and start tapping your way to crypto mastery! 
      
✅ Note: Bitopex is not just a meme, its already a full ready crypto options exchange!`,
            parse_mode: "HTML",
            ...telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.webApp("🎮 Start Game", webLink, false)],
                // [Markup.button.webApp("🎮 Start Game", webLink, false), Markup.button.url("Subscribe", subscribeLink, false)],
                [telegraf_1.Markup.button.url("Join Telegram Community", groupLink, false)],
                [telegraf_1.Markup.button.url("Join Telegram Announcement", channelLink, false)],
            ]),
        });
        // } else {
        //   await ctx.reply("<b>👍 Before continuing, subscribe to our channels:</b>", {
        //     parse_mode: "HTML",
        //     reply_markup: subscriptionMarkup.reply_markup,
        //   });
        // }
    }
    catch (error) {
        console.error("Error in start command:", error);
    }
});
exports.bot.action("check_sub", async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const user = await user_repositiry_1.UserRepository.getUserById(userId);
        console.log("🚀 ~ bot.action ~ user:", user);
        // if (await isUserSubscribed(ctx, ctx.from.id)) {
        if (user && user.register !== 1) {
            await user_repositiry_1.UserRepository.updateUser(userId, { register: 1, newRegister: 1 });
        }
        await ctx.replyWithPhoto({ source: imagePath }, {
            caption: `🚀 We're excited to introduce you to the simplest way to trade crypto options. To make learning fun and rewarding, we've launched a Telegram education tap game where you can collect points by tapping and learning about crypto options. The more points you collect the more you receive from the exclusive airdrop! Plus, our Bitopex token is gearing up to launch on the TON network.Join us now and start tapping your way to crypto mastery! 
      
✅ Note: Bitopex is not just a meme, its already a full ready crypto options exchange!`,
            parse_mode: "HTML",
            ...telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.webApp("🎮 Start Game", webLink, false)],
                [telegraf_1.Markup.button.url("Join Telegram Community", groupLink, false)],
                [telegraf_1.Markup.button.url("Join Telegram Announcement", channelLink, false)],
                // [Markup.button.webApp("🎮 Start Game", webLink, false), Markup.button.url("Subscribe", subscribeLink, false)],
                // [Markup.button.url("FAQ", faqLink, false), Markup.button.url("Game Instructions", gameLink, false)],
            ]),
        });
        // } else {
        //   await ctx.reply("<b>❌ You have not subscribed to the channel, subscribe to continue</b>", {
        //     parse_mode: "HTML",
        //     reply_markup: subscriptionMarkup.reply_markup,
        //   });
        // }
        await ctx.answerCbQuery(); // Answer callback query
    }
    catch (error) {
        console.error("Error in check_sub action:", error);
    }
});
void exports.bot.launch().catch((error) => {
    console.error("Error launching bot:", error);
});
console.log("Bot started");
//# sourceMappingURL=bot.js.map