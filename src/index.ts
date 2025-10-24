import { createBot } from "./bot/bot";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { env } from "./config/env";

async function initializeDatabase() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
    
    // Check if database has data, if not import workouts
    const locationCount = await prisma.location.count();
    if (locationCount === 0) {
      logger.info("Database is empty, importing workout data...");
      const { execSync } = await import("child_process");
      execSync("npm run import:workouts", { stdio: "inherit" });
      logger.info("Workout data imported successfully");
    } else {
      logger.info("Database already has data, skipping import");
    }
  } catch (error) {
    logger.error({ err: error }, "Database initialization failed");
    throw error;
  }
}

async function main() {
  try {
    logger.info("Starting FitZone Bot...");
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Database URL: ${env.DATABASE_URL}`);
    
    // Initialize database
    await initializeDatabase();
    
    // Create and launch bot
    const bot = createBot();
    await bot.launch();
    logger.info("Bot launched successfully");

    // Health check endpoint
    if (process.env.PORT) {
      const http = await import("http");
      const server = http.createServer((req, res) => {
        if (req.url === "/health") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("OK");
        } else {
          res.writeHead(404);
          res.end("Not Found");
        }
      });
      server.listen(process.env.PORT, () => {
        logger.info(`Health check server running on port ${process.env.PORT}`);
      });
    }

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await prisma.$disconnect();
        bot.stop(signal);
        logger.info("Shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, "Error during shutdown");
        process.exit(1);
      }
    };

    process.once("SIGINT", () => gracefulShutdown("SIGINT"));
    process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.once("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon

  } catch (error) {
    logger.error({ err: error }, "Failed to start bot");
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled Rejection");
  process.exit(1);
});

main().catch((err) => {
  logger.error({ err }, "Fatal error in main");
  process.exit(1);
});

