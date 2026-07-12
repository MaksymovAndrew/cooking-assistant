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

async function drainPool(): Promise<void> {
    await pool.end();
    process.exit(0);
}

function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
        drainPool().catch((err: unknown) => {
            logger.error({ err }, "error closing pg pool");
            process.exit(1);
        });
    });

    // force-exit if connections do not drain in time
    setTimeout(() => process.exit(1), SHUTDOWN_FORCE_EXIT_MS).unref();
}

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});
process.on("SIGINT", () => {
    shutdown("SIGINT");
});
