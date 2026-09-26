import i18next from "i18next";

import type { RecipeFilterParams } from "types/recipe";

import { contentLanguageFilter } from "utils/filters/contentLanguageFilter";

describe("contentLanguageFilter", () => {
    const def = contentLanguageFilter<RecipeFilterParams>();

    it("should read supported languages from the lang URL key and drop the rest", () => {
        expect(def.read(new URLSearchParams("lang=uk,de,pl"))).toEqual([
            "uk",
            "pl",
        ]);
    });

    it("should send the picked languages as a comma list", () => {
        expect(def.toParams(["pl", "ru"])).toEqual({ languages: "pl,ru" });
        expect(def.toParams([])).toEqual({});
    });

    it("should name a single language as a phrase", () => {
        expect(def.chipLabel?.(["uk"], i18next.t)).toBe("In Ukrainian");
    });

    it("should count several languages", () => {
        expect(def.chipLabel?.(["en", "pl"], i18next.t)).toBe("2 languages");
    });
});
