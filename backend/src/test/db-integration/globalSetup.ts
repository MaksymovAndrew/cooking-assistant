import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { runner } from "node-pg-migrate";

// each test file is its own worker process, so connection info is handed off
// via this file rather than an env var
const CONNECTION_INFO_PATH = path.join(__dirname, ".connection.json");
const migrationsDir = path.resolve(__dirname, "../../../migrations");

export default async function globalSetup(): Promise<void> {
    const container = await new PostgreSqlContainer(
        "postgres:16-alpine",
    ).start();

    (globalThis as { __PG_TESTCONTAINER__?: unknown }).__PG_TESTCONTAINER__ =
        container;

    const databaseUrl = container.getConnectionUri();

    await runner({
        databaseUrl,
        dir: migrationsDir,
        migrationsTable: "pgmigrations",
        direction: "up",
        count: Infinity,
    });

    writeFileSync(CONNECTION_INFO_PATH, JSON.stringify({ databaseUrl }));
}
