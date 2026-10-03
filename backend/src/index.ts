import { config } from "config/env";
import { logger } from "config/logger";

import { createApp } from "./app";
import controllers from "./composition-root";
import pool from "./db";

const SHUTDOWN_FORCE_EXIT_MS = 10000;

const app = createApp(controllers);

const server = app.listen(config.port, () => {
    logger.info(`server listening on ${config.port}`);
});

async function drainPool(exitCode: number): Promise<void> {
    await pool.end();
    process.exit(exitCode);
}

function shutdown(signal: string, exitCode = 0) {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
        drainPool(exitCode).catch((err: unknown) => {
            logger.error({ err }, "error closing pg pool");
            process.exit(1);
        });
    });

    setTimeout(() => process.exit(1), SHUTDOWN_FORCE_EXIT_MS).unref();
}

// state is unknown after a stray rejection or throw: exit and let the container restart
process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal({ err: reason }, "unhandled promise rejection");
    shutdown("unhandledRejection", 1);
});
process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaught exception");
    shutdown("uncaughtException", 1);
});
process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});
process.on("SIGINT", () => {
    shutdown("SIGINT");
});
