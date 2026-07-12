import { logger } from "config/logger";

import { runMigrations } from "./runMigrations";
import { runSeed } from "./runSeed";

// single entry the Container Apps Job runs on every deploy: apply pending migrations, then load idempotent reference data - no shell, no arg quoting
async function main(): Promise<void> {
    await runMigrations(["up"]);
    await runSeed();
}

main().catch((error: unknown) => {
    logger.error({ err: error }, "Database deploy (migrate + seed) failed");
    process.exitCode = 1;
});
