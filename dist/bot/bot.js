"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const telegraf_1 = require("telegraf");
const env_1 = require("../config/env");
const logger_1 = require("../lib/logger");
const prisma_1 = require("../lib/prisma");
function createBot() {
    const bot = new telegraf_1.Telegraf(env_1.env.BOT_TOKEN);
    bot.start(async (ctx) => {
        const user = ctx.from;
        const firstName = user?.first_name || "друг";
        const username = user?.username || null;
        const lastName = user?.last_name || null;
        const telegramId = BigInt(user?.id ?? 0);
        try {
            await prisma_1.prisma.user.upsert({
                where: { telegramId },
                create: { telegramId, username, firstName, lastName },
                update: { username, firstName, lastName },
            });
        }
        catch (e) {
            logger_1.logger.error({ err: e }, "Failed to upsert user");
        }
        await ctx.reply(`Привет, ${firstName}!`);
    });
    bot.on("message", async (ctx) => {
        const user = ctx.from;
        logger_1.logger.info({ from: user?.id, message: ctx.message }, "Incoming message");
    });
    bot.catch((err) => {
        logger_1.logger.error({ err }, "Bot error");
    });
    return bot;
}
//# sourceMappingURL=bot.js.map