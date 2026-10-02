import { logger } from "config/logger";

import { runMigrations } from "./runMigrations";
import { runSeed } from "./runSeed";

// the one entry the compose migrate service runs on every deploy: pending migrations, then the idempotent seed
async function main(): Promise<void> {
    await runMigrations(["up"]);
    await runSeed();
}

main().catch((error: unknown) => {
    logger.error({ err: error }, "Database deploy (migrate + seed) failed");
    process.exitCode = 1;
});
