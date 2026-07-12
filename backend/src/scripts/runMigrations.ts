import { runner } from "node-pg-migrate";
import path from "path";

import { config } from "config/env";
import { logger } from "config/logger";

type MigrationDirection = "up" | "down";

// both the standalone migrate entry and the combined deploy-db entry live in dist/scripts/, so ../../migrations resolves to /app/migrations in either bundle
const migrationsDir = path.resolve(__dirname, "../../migrations");

export async function runMigrations(args: string[]): Promise<void> {
    const direction: MigrationDirection = args.includes("down") ? "down" : "up";
    const fake = args.includes("--fake");

    const migrations = await runner({
        databaseUrl: config.db,
        dir: migrationsDir,
        migrationsTable: "pgmigrations",
        direction,
        count: direction === "down" ? 1 : Infinity,
        fake,
    });

    const names = migrations.map((migration) => migration.name);

    logger.info(
        { direction, fake, migrations: names },
        names.length
            ? `Migrations ${direction} applied`
            : "No pending migrations",
    );
}
