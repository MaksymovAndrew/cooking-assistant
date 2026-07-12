import { unlinkSync } from "node:fs";
import path from "node:path";
import type { StartedTestContainer } from "testcontainers";

const CONNECTION_INFO_PATH = path.join(__dirname, ".connection.json");

export default async function globalTeardown(): Promise<void> {
    const container = (
        globalThis as { __PG_TESTCONTAINER__?: StartedTestContainer }
    ).__PG_TESTCONTAINER__;

    await container?.stop();

    try {
        unlinkSync(CONNECTION_INFO_PATH);
    } catch {
        // file may already be gone
    }
}
