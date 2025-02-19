import { ContentType, MessageFrom, type channelMessages } from "@prisma/client";
import { type Response } from "express";
import JSONbig from "json-bigint";
import sanitizeHtml from "sanitize-html";
import { type Context, Markup, type Telegraf } from "telegraf";
// eslint-disable-next-line import/no-unresolved
import { type Update } from "telegraf/typings/core/types/typegram";

import { prisma } from "../prisma";

export const sendSuccessResponseWithoutList = (res: Response, data: unknown, statusCode: number, message: string): Response => {
  return res
    .status(statusCode)
    .set("Content-Type", "application/json")
    .send(
      JSONbig.stringify({
        statusMessage: "success",
        status: statusCode,
        data,
        message,
      }),
    );
};

// Process pending messages
export const processPendingMessages = async (bot: Telegraf<Context<Update>>) => {
  try {
    let processingMessage = await prisma.channelMessages.findFirst({
      where: { status: 1 },
    });

    console.log("message found with status 1 = ", processingMessage?.id, "and offset = ", processingMessage?.offset);

    if (!processingMessage) {
      processingMessage = await prisma.channelMessages.findFirst({
        where: { status: 0 },
        orderBy: { id: "asc" },
      });

      if (processingMessage) {
        console.log("starting the process for the message: ", processingMessage?.id);
        await prisma.channelMessages.update({
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
    const users = await prisma.$replica().users.findMany({
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

    let sanitizedMessageText: string | null;
    if (processingMessage.messageFrom === MessageFrom.Admin) {
      const MESSAGE = processingMessage.content;

      // @ts-expect-error error in the type
      const formattedMessageText = MESSAGE.replace(/<\/?p>/g, "").replace(/<br\s*\/?>/g, "\n");

      sanitizedMessageText = sanitizeHtml(formattedMessageText, {
        allowedTags: ["b", "i", "a", "code", "pre", "strong", "em", "u"],
        allowedAttributes: {
          a: ["href"],
        },
      });
    } else {
      sanitizedMessageText = processingMessage.content;
    }

    console.log("processingMessage.offset - ", processingMessage?.offset, "users.length = ", users?.length);

    const newOffset = processingMessage.offset + users.length;
    const totalUsers = await prisma.users.count();
    // const newOffset = processingMessage.offset + 5;
    // const totalUsers = 5;

    await prisma.channelMessages.update({
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
          await sendMessageFromAdmin(bot, processingMessage, chatId, sanitizedMessageText ?? "");
        } catch (e) {
          console.error(`Error sending broadcast message to ${chatId}:`, e);
          continue;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (newOffset >= totalUsers) {
      console.log("Message processed and completed:", processingMessage?.id);
    } else {
      console.log("Message processing paused, will resume from offset:", newOffset);
    }
  } catch (error) {
    console.error("Error processing pending messages:", error);
  }
};

// Send broadcast message
export const sendBroadcastMessage = async (bot: Telegraf<Context<Update>>, pendingMessage: channelMessages) => {
  try {
    const limit = 29;
    const users = await prisma.$replica().users.findMany({
      skip: pendingMessage.offset,
      take: limit,
      select: { user_id: true },
    });

    let sanitizedMessageText: string | null;
    if (pendingMessage.messageFrom === MessageFrom.Admin) {
      const MESSAGE = pendingMessage.content;
      const formattedMessageText = MESSAGE?.replace(/<\/?p>/g, "").replace(/<br\s*\/?>/g, "\n");

      sanitizedMessageText = sanitizeHtml(formattedMessageText ?? "", {
        allowedTags: ["b", "i", "a", "code", "pre", "strong", "em", "u"],
        allowedAttributes: {
          a: ["href"],
        },
      });
    } else {
      sanitizedMessageText = pendingMessage.content;
    }

    for (const user of users) {
      const chatId = user.user_id;
      console.log("ANNOUNCEMENT:-", "CHATID:", chatId);
      try {
        await sendMessageFromAdmin(bot, pendingMessage, chatId, sanitizedMessageText ?? "");
      } catch (e) {
        console.error(`Error sending broadcast message to ${chatId}:`, e);
      }
    }

    const newOffset = pendingMessage.offset + users.length;
    const totalUsers = await prisma.users.count();

    await prisma.channelMessages.update({
      where: { id: pendingMessage.id },
      data: {
        offset: newOffset,
        status: newOffset >= totalUsers ? 2 : 1,
      },
    });

    if (newOffset >= totalUsers) {
      console.log("All messages sent successfully.");
    } else {
      console.log("Messages sent successfully up to offset:", newOffset);
    }
  } catch (error) {
    console.error("Error sending broadcast messages:", error);
    throw error; // Throw error to be handled in the processPendingMessages function
  }
};

export const sendMessageFromAdmin = async (
  bot: Telegraf<Context<Update>>,
  content: channelMessages,
  chatId: string | number,
  message: string,
) => {
  try {
    const buttonLink = process.env.DOMAIN ?? "";

    if (content.contentType === ContentType.Message) {
      // Send text message
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_markup: content.buttonText
          ? Markup.inlineKeyboard([Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
          : undefined,
      });
    } else if (content.contentType === ContentType.Sticker) {
      // Send sticker
      await bot.telegram.sendSticker(chatId, content.url ?? "");
    } else if (content.contentType === ContentType.Animation) {
      // Send animation
      await bot.telegram.sendAnimation(chatId, content.url ?? "", {
        caption: message,
        parse_mode: "HTML",
        reply_markup: content.buttonText
          ? Markup.inlineKeyboard([Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
          : undefined,
      });
    } else if (content.contentType === ContentType.Video) {
      await bot.telegram.sendVideo(chatId, content.url ?? "", {
        caption: message,
        parse_mode: "HTML",
        reply_markup: content.buttonText
          ? Markup.inlineKeyboard([Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
          : undefined,
      });
    } else if (content.contentType === ContentType.Photo) {
      await bot.telegram.sendPhoto(chatId, content.url ?? "", {
        caption: message,
        parse_mode: "HTML",
        reply_markup: content.buttonText
          ? Markup.inlineKeyboard([Markup.button.webApp(content.buttonText, buttonLink, false)]).reply_markup
          : undefined,
      });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error; // Rethrow the error to be caught in the sendBroadcastMessage function
  }
};
