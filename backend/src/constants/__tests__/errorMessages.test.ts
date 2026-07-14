import fs from "fs";
import path from "path";

import { ERROR_CODES } from "constants/errorMessages";

// the frontend can't import this file directly (separate package), so it keeps its own hand-copied mirror in frontend/src/constants/errorCodes.ts - this guards against that copy silently drifting
const FRONTEND_ERROR_CODES_PATH = path.resolve(
    __dirname,
    "../../../../frontend/src/constants/errorCodes.ts",
);

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("ERROR_CODES", () => {
    it("should stay in sync with the frontend's mirrored ERROR_CODES", () => {
        const frontendSource = fs.readFileSync(
            FRONTEND_ERROR_CODES_PATH,
            "utf8",
        );

        Object.entries(ERROR_CODES).forEach(([key, value]) => {
            // whitespace/quote-style tolerant, so a harmless frontend reformat doesn't fail this test on its own
            const pattern = new RegExp(
                `${escapeRegExp(key)}\\s*:\\s*["']${escapeRegExp(value)}["']`,
            );

            expect(frontendSource).toMatch(pattern);
        });
    });
});
