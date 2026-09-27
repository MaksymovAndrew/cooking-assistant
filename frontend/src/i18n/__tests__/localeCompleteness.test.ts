import { DEFAULT_LOCALE, LOCALES } from "constants/locales";

import enCatalog from "i18n/locales/en/catalog.json";
import plCatalog from "i18n/locales/pl/catalog.json";
import ruCatalog from "i18n/locales/ru/catalog.json";
import ukCatalog from "i18n/locales/uk/catalog.json";
import { RESOURCES } from "i18n/resources";

const TRANSLATED_LOCALES = LOCALES.filter(
    (locale) => locale !== DEFAULT_LOCALE,
);
const CATALOGS: Record<string, object> = {
    pl: plCatalog,
    ru: ruCatalog,
    uk: ukCatalog,
};
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
const WORD = /\p{L}+/gu;
// the title template's slot for the page title
const TITLE_SLOT = "%s";
const CATALOG_NAMESPACE = "catalog";
const DATE_SUFFIX = ".date";
// the brand and the units every one of these languages writes the same way
const SHARED_WORDS = new Set([
    "Cooking",
    "Assistant",
    "kcal",
    "min",
    "g",
    "kg",
    "ml",
    "tag",
]);

// food names (tofu, kiwi, gluten) and release dates are legitimately the same in every language
const mayEqualEnglish = (namespace: string, key: string): boolean =>
    namespace === CATALOG_NAMESPACE || key.endsWith(DATE_SUFFIX);

const hasWordsToTranslate = (text: string): boolean =>
    (
        text.replace(TITLE_SLOT, "").replace(PLACEHOLDER, "").match(WORD) ?? []
    ).some((word) => !SHARED_WORDS.has(word));

// namespace files nest objects of strings; anything else is skipped rather than trusted
const flatten = (tree: object, prefix = ""): Map<string, string> => {
    const entries = new Map<string, string>();

    Object.entries(tree).forEach(([key, value]: [string, unknown]) => {
        const path = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "string") {
            entries.set(path, value);
        } else if (typeof value === "object" && value !== null) {
            flatten(value, path).forEach((text, nested) => {
                entries.set(nested, text);
            });
        }
    });

    return entries;
};

const pluralBase = (key: string): string | null =>
    PLURAL_SUFFIX.test(key) ? key.replace(PLURAL_SUFFIX, "") : null;

// an English key with plural forms becomes every form the target language has
const expectedKeys = (english: Map<string, string>, locale: string) => {
    const categories = new Intl.PluralRules(locale).resolvedOptions()
        .pluralCategories;
    const keys = new Set<string>();

    english.forEach((_, key) => {
        const base = pluralBase(key);

        if (base === null) {
            keys.add(key);
        } else {
            categories.forEach((category) => keys.add(`${base}_${category}`));
        }
    });

    return keys;
};

const placeholders = (text: string): string[] =>
    [...text.matchAll(PLACEHOLDER)].map((match) => match[1]).sort();

// plural forms are compared with the English "other", which names every placeholder the sentence uses
const englishSource = (english: Map<string, string>, key: string): string => {
    const base = pluralBase(key);

    return (
        (base === null ? english.get(key) : english.get(`${base}_other`)) ?? ""
    );
};

const namespacesOf = (locale: (typeof TRANSLATED_LOCALES)[number]) => {
    const english = new Map<string, object>(
        Object.entries(RESOURCES[DEFAULT_LOCALE]),
    );

    return Object.entries(RESOURCES[locale]).map(([namespace, tree]) => ({
        namespace,
        translated: flatten(tree),
        english: flatten(english.get(namespace) ?? {}),
    }));
};

describe.each(TRANSLATED_LOCALES)("the %s translation", (locale) => {
    it("should have every key English has, in every plural form of the language", () => {
        namespacesOf(locale).forEach(({ namespace, translated, english }) => {
            expect([namespace, [...translated.keys()].sort()]).toEqual([
                namespace,
                [...expectedKeys(english, locale)].sort(),
            ]);
        });
    });

    it("should keep every placeholder of the English sentence", () => {
        namespacesOf(locale).forEach(({ namespace, translated, english }) => {
            translated.forEach((text, key) => {
                expect([namespace, key, placeholders(text)]).toEqual([
                    namespace,
                    key,
                    placeholders(englishSource(english, key)),
                ]);
            });
        });
    });

    it("should leave no string empty or still in English", () => {
        namespacesOf(locale).forEach(({ namespace, translated, english }) => {
            translated.forEach((text, key) => {
                const leftInEnglish =
                    text === english.get(key) &&
                    !mayEqualEnglish(namespace, key) &&
                    hasWordsToTranslate(text);

                expect([
                    namespace,
                    key,
                    text.trim() === "",
                    leftInEnglish,
                ]).toEqual([namespace, key, false, false]);
            });
        });
    });

    it("should name every catalog ingredient, category and allergen", () => {
        const translated = flatten(CATALOGS[locale]);

        expect([...translated.keys()].sort()).toEqual(
            [...flatten(enCatalog).keys()].sort(),
        );
        translated.forEach((text) => {
            expect(text.trim()).not.toBe("");
        });
    });
});
