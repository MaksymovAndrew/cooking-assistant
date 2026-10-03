import i18next from "i18next";

import { LOCALES } from "constants/locales";

import { RESOURCES } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";

const t = i18next.getFixedT("en");

const newestFirst = (dates: string[]): string[] => [...dates].sort().reverse();

describe("getNewsItems", () => {
    it("should key each entry by its news.json id", () => {
        const [id, entry] = Object.entries(RESOURCES.en.news.items)[0];

        expect(getNewsItems(t)[0]).toEqual({ id, ...entry });
    });

    it.each(LOCALES)(
        "should keep the %s entries newest first, as the badge relies on",
        async (locale) => {
            const dates = getNewsItems(await getServerTranslation(locale)).map(
                (entry) => entry.date,
            );

            expect(dates).toEqual(newestFirst(dates));
        },
    );
});

describe("getLatestReleaseDate", () => {
    it("should be the date of the newest entry", () => {
        const dates = getNewsItems(t).map((entry) => entry.date);

        expect(getLatestReleaseDate(t)).toBe(newestFirst(dates)[0]);
    });
});
