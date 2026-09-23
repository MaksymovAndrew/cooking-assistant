import fs from "fs";
import path from "path";

import { AVATAR_KEYS } from "constants/avatarKeys";

// the zod enum for profile updates is built from this list, so a key the frontend offers but this copy lacks rejects a valid avatar
const FRONTEND_AVATARS_PATH = path.resolve(
    __dirname,
    "../../../../frontend/src/constants/avatars.ts",
);

const REGISTRY_START = "AVATAR_REGISTRY";
const REGISTRY_END = "};";

// Prettier writes one `key: Component,` line per registry entry, quoting only keys that need it
function parseRegistryKeys(source: string): string[] {
    const start = source.indexOf(REGISTRY_START);
    const body = source.slice(start, source.indexOf(REGISTRY_END, start));

    return body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.endsWith(","))
        .map((line) => line.slice(0, line.indexOf(":")).replaceAll('"', ""));
}

describe("AVATAR_KEYS", () => {
    it("should match the frontend's avatar registry exactly", () => {
        const frontendSource = fs.readFileSync(FRONTEND_AVATARS_PATH, "utf8");

        expect(parseRegistryKeys(frontendSource).sort()).toEqual(
            [...AVATAR_KEYS].sort(),
        );
    });
});
