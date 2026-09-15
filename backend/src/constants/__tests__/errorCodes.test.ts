import fs from "fs";
import path from "path";

import { ERROR_CODES } from "constants/errorCodes";

// the frontend can't import this file directly (separate package), so it keeps its own hand-copied mirror in frontend/src/constants/errorCodes.ts - this guards against that copy silently drifting in either direction
const FRONTEND_ERROR_CODES_PATH = path.resolve(
    __dirname,
    "../../../../frontend/src/constants/errorCodes.ts",
);

const ENTRY_SEPARATOR = ': "';
const ENTRY_END = '",';

// both files are Prettier-formatted, so every entry is exactly one `KEY: "value",` line
function parseEntries(source: string): Record<string, string> {
    return Object.fromEntries(
        source
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.endsWith(ENTRY_END))
            .map((line) => {
                const separatorIndex = line.indexOf(ENTRY_SEPARATOR);

                return [
                    line.slice(0, separatorIndex),
                    line.slice(
                        separatorIndex + ENTRY_SEPARATOR.length,
                        -ENTRY_END.length,
                    ),
                ];
            }),
    );
}

describe("ERROR_CODES", () => {
    it("should match the frontend's mirrored ERROR_CODES exactly", () => {
        const frontendSource = fs.readFileSync(
            FRONTEND_ERROR_CODES_PATH,
            "utf8",
        );

        expect(parseEntries(frontendSource)).toEqual(ERROR_CODES);
    });
});
