import { createBot } from "./bot/bot";
import { logger } from "./lib/logger";

async function main() {
  const bot = createBot();
  await bot.launch();
  logger.info("Bot started");

  // Enable graceful stop
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

