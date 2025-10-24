"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "info",
    ...(process.env.NODE_ENV !== "production" && { transport: { target: "pino-pretty" } }),
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});
//# sourceMappingURL=logger.js.map