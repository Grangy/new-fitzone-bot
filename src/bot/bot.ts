import { Telegraf } from "telegraf";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";

export function createBot() {
  const bot = new Telegraf(env.BOT_TOKEN);

  bot.start(async (ctx) => {
    const user = ctx.from;
    const firstName = user?.first_name || "друг";
    const username = user?.username || null;
    const lastName = user?.last_name || null;
    const telegramId = BigInt(user?.id ?? 0);

    try {
      await prisma.user.upsert({
        where: { telegramId },
        create: { telegramId, username, firstName, lastName },
        update: { username, firstName, lastName },
      });
    } catch (e) {
      logger.error({ err: e }, "Failed to upsert user");
    }

    await ctx.reply(`Привет, ${firstName}!`);
  });

  bot.on("message", async (ctx) => {
    const user = ctx.from;
    logger.info({ from: user?.id, message: ctx.message }, "Incoming message");
  });

  bot.catch((err) => {
    logger.error({ err }, "Bot error");
  });

  return bot;
}

