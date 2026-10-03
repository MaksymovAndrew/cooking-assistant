import i18next from "i18next";

import {
    activeDefs,
    buildParams,
    readState,
    resetState,
    writeState,
} from "utils/filters/filterState";
import {
    MENU_FILTER_DEFS,
    type MenuFilterState,
} from "utils/filters/menuFilterDefs";

const t = i18next.getFixedT("en", "menu");

const EVERY_FILTER_SET: MenuFilterState = {
    search: "week",
    categories: [2, 3],
    favourites: true,
    topRated: true,
    sort: "rating",
    languages: ["pl", "en"],
};

const chipFor = (key: string, value: unknown): string | undefined =>
    MENU_FILTER_DEFS.find((def) => def.key === key)?.chipLabel?.(value, t);

describe("MENU_FILTER_DEFS", () => {
    it("should start with no filter active", () => {
        expect(
            activeDefs(MENU_FILTER_DEFS, resetState(MENU_FILTER_DEFS)),
        ).toEqual([]);
    });

    it("should read back every filter it writes, so no two share a URL key", () => {
        const url = writeState(
            MENU_FILTER_DEFS,
            { ...EVERY_FILTER_SET },
            new URLSearchParams(),
        );

        expect(readState(MENU_FILTER_DEFS, url)).toEqual(EVERY_FILTER_SET);
    });

    it("should send every set filter as its request param", () => {
        expect(buildParams(MENU_FILTER_DEFS, { ...EVERY_FILTER_SET })).toEqual({
            menu_name: "week",
            category_ids: "2,3",
            favourites: true,
            top_rated: true,
            sort_order: "rating",
            languages: "pl,en",
        });
    });

    it("should ignore a sort the menu list does not offer", () => {
        expect(
            readState(MENU_FILTER_DEFS, new URLSearchParams("sort=asc")),
        ).toEqual(expect.objectContaining({ sort: null }));
    });

    it("should label each filter's chip", () => {
        expect(chipFor("search", "week")).toBe("“week”");
        expect(chipFor("categories", [2, 3])).toBe("2 categories");
        expect(chipFor("favourites", true)).toBe("Favourites");
        expect(chipFor("topRated", true)).toBe("4+ stars");
        expect(chipFor("sort", "rating")).toBe("Top rated first");
    });
});
