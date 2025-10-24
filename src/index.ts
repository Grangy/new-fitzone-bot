import { createBot } from "./bot/bot";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("Database connected successfully");

    const bot = createBot();
    await bot.launch();
    logger.info("Bot started");

    // Enable graceful stop
    process.once("SIGINT", async () => {
      logger.info("Shutting down gracefully...");
      await prisma.$disconnect();
      bot.stop("SIGINT");
    });
    process.once("SIGTERM", async () => {
      logger.info("Shutting down gracefully...");
      await prisma.$disconnect();
      bot.stop("SIGTERM");
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start bot");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

