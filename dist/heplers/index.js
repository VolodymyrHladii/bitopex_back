"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageFromAdmin = exports.sendBroadcastMessage = exports.processPendingMessages = exports.sendSuccessResponseWithoutList = void 0;
const tslib_1 = require("tslib");
const client_1 = require("@prisma/client");
const json_bigint_1 = tslib_1.__importDefault(require("json-bigint"));
const sanitize_html_1 = tslib_1.__importDefault(require("sanitize-html"));
const telegraf_1 = require("telegraf");
const prisma_1 = require("../prisma");
const sendSuccessResponseWithoutList = (res, data, statusCode, message) => {
    return res
        .status(statusCode)
        .set("Content-Type", "application/json")
        .send(json_bigint_1.default.stringify({
        statusMessage: "success",
        status: statusCode,
        data,
        message,
    }));
};
exports.sendSuccessResponseWithoutList = sendSuccessResponseWithoutList;
// Process pending messages
const processPendingMessages = async (bot) => {
    try {
        let processingMessage = await prisma_1.prisma.channelMessages.findFirst({
            where: { status: 1 },
        });
        console.log("message found with status 1 = ", processingMessage?.id, "and offset = ", processingMessage?.offset);
        if (!processingMessage) {
            processingMessage = await prisma_1.prisma.channelMessages.findFirst({
                where: { status: 0 },
                orderBy: { id: "asc" },
            });
            if (processingMessage) {
                console.log("starting the process for the message: ", processingMessage?.id);
                await prisma_1.prisma.channelMessages.update({
                    where: { id: processingMessage.id },
                    data: { status: 1 },
                });
            }
        }
        if (!processingMessage) {
            console.log("No pending messages found.");
            return;
        }
        const limit = 1450;
        const users = await prisma_1.prisma.$replica().users.findMany({
            skip: processingMessage.offset,
            take: limit,
            select: { user_id: true },
        });
        // const users = [
        //   { user_id: 374482589 }, // dhanush
        //   { user_id: 5273257384 }, // dinesh
        //   // { user_id: 7438068974 }, // ankita
        //   // { user_id: 7267092543 }, // Naman
        //   // { user_id: 633898123 }, // ketul
        //   // { user_id: 924116944 }, // sarjak
        // ];
        let sanitizedMessageText;
        if (processingMessage.messageFrom === client_1.MessageFrom.Admin) {
            const MESSAGE = processingMessage.content;
            // @ts-expect-error error in the type
            const formattedMessageText = MESSAGE.replace(/<\/?p>/g, "").replace(/<br\s*\/?>/g, "\n");
            sanitizedMessageText = (0, sanitize_html_1.default)(formattedMessageText, {
                allowedTags: ["b", "i", "a", "code", "pre", "strong", "em", "u"],
                allowedAttributes: {
                    a: ["href"],
                },
            });
        }
        else {
            sanitizedMessageText = processingMessage.content;
        }
        console.log("processingMessage.offset - ", processingMessage?.offset, "users.length = ", users?.length);
        const newOffset = processingMessage.offset + users.length;
        const totalUsers = await prisma_1.prisma.users.count();
        // const newOffset = processingMessage.offset + 5;
        // const totalUsers = 5;
        await prisma_1.prisma.channelMessages.update({
            where: { id: processingMessage.id },
            data: {
                offset: newOffset,
                status: newOffset >= totalUsers ? 2 : 1,
            },
        });
        // Keeping 29 as the limit is 30
        for (let i = 0; i < users.length; i += 29) {
            const chunk = users.slice(i, i + 29);
            for (let j = 0; j < chunk.length; j++) {
                const chatId = chunk[j].user_id;
                console.log("ANNOUNCEMENT:-", "CHATID:", chatId);
                try {
                    await (0, exports.sendMessageFromAdmin)(bot, processingMessage, chatId, sanitizedMessageText ?? "");
                }
                catch (e) {
                    console.error(`Error sending broadcast message to ${chatId}:`, e);
                    continue;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (newOffset >= totalUsers) {
            console.log("Message processed and completed:", processingMessage?.id);
        }
        else {
            console.log("Message processing paused, will resume from offset:", newOffset);
        }
    }
    catch (error) {
        console.error("Error processing pending messages:", error);
    }
};
exports.processPendingMessages = processPendingMessages;
// Send broadcast message
const sendBroadcastMessage = async (bot, pendingMessage) => {
    try {
        const limit = 29;
        const users = await prisma_1.prisma.$replica().users.findMany({
            skip: pendingMessage.offset,
            take: limit,
            select: { user_id: true },
        });
        let sanitizedMessageText;
        if (pendingMessage.messageFrom === client_1.MessageFrom.Admin) {
            const MESSAGE = pendingMessage.content;
            const formattedMessageText = MESSAGE?.replace(/<\/?p>/g, "").replace(/<br\s*\/?>/g, "\n");
            sanitizedMessageText = (0, sanitize_html_1.default)(formattedMessageText ?? "", {
                allowedTags: ["b", "i", "a", "code", "pre", "strong", "em", "u"],
                allowedAttributes: {
                    a: ["href"],
                },
            });
        }
        else {
            sanitizedMessageText = pendingMessage.content;
        }
        for (const user of users) {
            const chatId = user.user_id;
            console.log("ANNOUNCEMENT:-", "CHATID:", chatId);
            try {
                await (0, exports.sendMessageFromAdmin)(bot, pendingMessage, chatId, sanitizedMessageText ?? "");
            }
            catch (e) {
                console.error(`Error sending broadcast message to ${chatId}:`, e);
            }
        }
        const newOffset = pendingMessage.offset + users.length;
        const totalUsers = await prisma_1.prisma.users.count();
        await prisma_1.prisma.channelMessages.update({
            where: { id: pendingMessage.id },
            data: {
                offset: newOffset,
                status: newOffset >= totalUsers ? 2 : 1,
            },
        });
        if (newOffset >= totalUsers) {
            console.log("All messages sent successfully.");
        }
        else {
            console.log("Messages sent successfully up to offset:", newOffset);
        }
    }
    catch (error) {
        console.error("Error sending broadcast messages:", error);
        throw error; // Throw error to be handled in the processPendingMessages function
    }
};
exports.sendBroadcastMessage = sendBroadcastMessage;
const sendMessageFromAdmin = async (bot, content, chatId, message) => {
    try {
        const buttonLink = process.env.DOMAIN ?? "";
        if (content.contentType === client_1.ContentType.Message) {
            // Send text message
            await bot.telegram.sendMessage(chatId, message, {
                parse_mode: "HTML",
                reply_markup: content.buttonText
                    ? telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
                    : undefined,
            });
        }
        else if (content.contentType === client_1.ContentType.Sticker) {
            // Send sticker
            await bot.telegram.sendSticker(chatId, content.url ?? "");
        }
        else if (content.contentType === client_1.ContentType.Animation) {
            // Send animation
            await bot.telegram.sendAnimation(chatId, content.url ?? "", {
                caption: message,
                parse_mode: "HTML",
                reply_markup: content.buttonText
                    ? telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
                    : undefined,
            });
        }
        else if (content.contentType === client_1.ContentType.Video) {
            await bot.telegram.sendVideo(chatId, content.url ?? "", {
                caption: message,
                parse_mode: "HTML",
                reply_markup: content.buttonText
                    ? telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
                    : undefined,
            });
        }
        else if (content.contentType === client_1.ContentType.Photo) {
            await bot.telegram.sendPhoto(chatId, content.url ?? "", {
                caption: message,
                parse_mode: "HTML",
                reply_markup: content.buttonText
                    ? telegraf_1.Markup.inlineKeyboard([telegraf_1.Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
                    : undefined,
            });
        }
    }
    catch (error) {
        console.error("Error sending message:", error);
        throw error; // Rethrow the error to be caught in the sendBroadcastMessage function
    }
};
exports.sendMessageFromAdmin = sendMessageFromAdmin;
//# sourceMappingURL=index.js.map