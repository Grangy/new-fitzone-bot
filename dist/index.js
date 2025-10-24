"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot/bot");
const logger_1 = require("./lib/logger");
const prisma_1 = require("./lib/prisma");
const env_1 = require("./config/env");
async function initializeDatabase() {
    try {
        await prisma_1.prisma.$connect();
        logger_1.logger.info("Database connected successfully");
        // Check if database has data, if not import workouts
        const locationCount = await prisma_1.prisma.location.count();
        if (locationCount === 0) {
            logger_1.logger.info("Database is empty, importing workout data...");
            const { execSync } = await Promise.resolve().then(() => __importStar(require("child_process")));
            execSync("npm run import:workouts", { stdio: "inherit" });
            logger_1.logger.info("Workout data imported successfully");
        }
        else {
            logger_1.logger.info("Database already has data, skipping import");
        }
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Database initialization failed");
        throw error;
    }
}
async function main() {
    try {
        logger_1.logger.info("Starting FitZone Bot...");
        logger_1.logger.info(`Environment: ${env_1.env.NODE_ENV}`);
        logger_1.logger.info(`Database URL: ${env_1.env.DATABASE_URL}`);
        // Initialize database
        await initializeDatabase();
        // Create and launch bot
        const bot = (0, bot_1.createBot)();
        await bot.launch();
        logger_1.logger.info("Bot launched successfully");
        // Health check endpoint
        if (process.env.PORT) {
            const http = await Promise.resolve().then(() => __importStar(require("http")));
            const server = http.createServer((req, res) => {
                if (req.url === "/health") {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("OK");
                }
                else {
                    res.writeHead(404);
                    res.end("Not Found");
                }
            });
            server.listen(process.env.PORT, () => {
                logger_1.logger.info(`Health check server running on port ${process.env.PORT}`);
            });
        }
        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, shutting down gracefully...`);
            try {
                await prisma_1.prisma.$disconnect();
                bot.stop(signal);
                logger_1.logger.info("Shutdown completed");
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error({ err: error }, "Error during shutdown");
                process.exit(1);
            }
        };
        process.once("SIGINT", () => gracefulShutdown("SIGINT"));
        process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.once("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Failed to start bot");
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger_1.logger.error({ err: error }, "Uncaught Exception");
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    logger_1.logger.error({ reason, promise }, "Unhandled Rejection");
    process.exit(1);
});
main().catch((err) => {
    logger_1.logger.error({ err }, "Fatal error in main");
    process.exit(1);
});
//# sourceMappingURL=index.js.map