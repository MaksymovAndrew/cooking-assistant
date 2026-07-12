import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const CONNECTION_INFO_PATH = path.join(__dirname, ".connection.json");

export function createTestPool(): Pool {
    const { databaseUrl } = JSON.parse(
        readFileSync(CONNECTION_INFO_PATH, "utf8"),
    ) as { databaseUrl: string };

    return new Pool({ connectionString: databaseUrl });
}
