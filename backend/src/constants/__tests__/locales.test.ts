import fs from "fs";
import path from "path";

import { LOCALES } from "constants/locales";

// a language only one side knows falls back to English, or is refused when an account saves it
const FRONTEND_LOCALES_PATH = path.resolve(
    __dirname,
    "../../../../frontend/src/constants/locales.ts",
);

const LOCALES_LINE = /^export const LOCALES = \[(.*)\] as const;$/m;

function parseLocales(source: string): string[] {
    const list = LOCALES_LINE.exec(source)?.[1] ?? "";

    return list.split(",").map((entry) => entry.trim().replaceAll('"', ""));
}

describe("LOCALES", () => {
    it("should match the frontend's languages in the same order", () => {
        const frontendSource = fs.readFileSync(FRONTEND_LOCALES_PATH, "utf8");

        expect(parseLocales(frontendSource)).toEqual([...LOCALES]);
    });
});
