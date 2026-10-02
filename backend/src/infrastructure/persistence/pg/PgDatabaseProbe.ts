import type { Pool } from "pg";

import { logger } from "config/logger";

import type { DatabaseProbe } from "application/ports/DatabaseProbe";

// well under the 5s the container health check waits, so a stalled database answers 503 instead of a timeout
const PROBE_TIMEOUT_MS = 2000;

export default class PgDatabaseProbe implements DatabaseProbe {
    constructor(private pool: Pool) {}

    async isReachable(): Promise<boolean> {
        let timer: NodeJS.Timeout | undefined;
        const timeout = new Promise<false>((resolve) => {
            timer = setTimeout(() => {
                resolve(false);
            }, PROBE_TIMEOUT_MS);
        });
        const query = this.pool.query("SELECT 1").then(
            () => true,
            (err: unknown) => {
                logger.error({ err }, "database health probe failed");

                return false;
            },
        );

        try {
            return await Promise.race([query, timeout]);
        } finally {
            clearTimeout(timer);
        }
    }
}
