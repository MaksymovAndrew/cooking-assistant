import rawCatalogData from "scripts/catalog/catalogData.json";
import { parseCatalogData } from "scripts/catalog/catalogDataSchema";

const NAME_FIELDS = ["nameRu", "nameUk", "namePl"] as const;
const STRESS_MARKS = /[\u0300\u0301]/u;
const CYRILLIC = /\p{Script=Cyrillic}/u;
const LATIN = /\p{Script=Latin}/u;
const WORD = /[\p{L}'’]+/gu;

const entries = parseCatalogData(rawCatalogData);

const namesOf = (field: (typeof NAME_FIELDS)[number]) =>
    entries.map((entry) => ({ slug: entry.slug, name: entry[field] ?? "" }));

// a word that mixes alphabets (a latin "c" in "cливочное") looks right and never matches a search
const mixesAlphabets = (name: string): boolean =>
    (name.match(WORD) ?? []).some(
        (word) => CYRILLIC.test(word) && LATIN.test(word),
    );

describe.each(NAME_FIELDS)("catalog %s", (field) => {
    it("should name every ingredient", () => {
        namesOf(field).forEach(({ slug, name }) => {
            expect([slug, name.trim() === ""]).toEqual([slug, false]);
        });
    });

    it("should start every name with a capital letter", () => {
        namesOf(field).forEach(({ slug, name }) => {
            expect([slug, name.charAt(0)]).toEqual([
                slug,
                name.charAt(0).toUpperCase(),
            ]);
        });
    });

    it("should carry no stress marks and no word written in two alphabets", () => {
        namesOf(field).forEach(({ slug, name }) => {
            expect([
                slug,
                STRESS_MARKS.test(name),
                mixesAlphabets(name),
            ]).toEqual([slug, false, false]);
        });
    });

    it("should give no two ingredients the same name", () => {
        const names = namesOf(field).map(({ name }) => name);

        expect(
            names.filter((name, index) => names.indexOf(name) !== index),
        ).toEqual([]);
    });
});
