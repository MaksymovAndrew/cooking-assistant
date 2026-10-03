import { logger } from "config/logger";

import { runMigrations } from "./runMigrations";
import { runSeed } from "./runSeed";

// the compose migrate service runs this on every deploy
async function main(): Promise<void> {
    await runMigrations(["up"]);
    await runSeed();
}

main().catch((error: unknown) => {
    logger.error({ err: error }, "Database deploy (migrate + seed) failed");
    process.exitCode = 1;
});
