import { runner } from "node-pg-migrate";
import path from "path";

import { config } from "config/env";
import { logger } from "config/logger";

type MigrationDirection = "up" | "down";

// both the standalone migrate entry and the combined deploy-db entry live in dist/scripts/, so ../../migrations resolves to /app/migrations in either bundle
const migrationsDir = path.resolve(__dirname, "../../migrations");

const KNOWN_ARGS = new Set(["up", "down", "--fake"]);

// a typo such as "dwon" must stop the run, not quietly migrate up
function parseArgs(args: string[]): {
    direction: MigrationDirection;
    fake: boolean;
} {
    const unknown = args.filter((arg) => !KNOWN_ARGS.has(arg));
    const bothDirections = args.includes("up") && args.includes("down");

    if (unknown.length > 0 || bothDirections) {
        throw new Error(
            `Usage: migrate [up|down] [--fake], got: ${args.join(" ")}`,
        );
    }

    return {
        direction: args.includes("down") ? "down" : "up",
        fake: args.includes("--fake"),
    };
}

export async function runMigrations(args: string[]): Promise<void> {
    const { direction, fake } = parseArgs(args);

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
