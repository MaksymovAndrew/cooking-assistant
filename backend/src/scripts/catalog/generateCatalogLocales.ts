// build-time: turns catalogData.json into the four frontend catalog.json locale files - only en/ is imported by the running app (see frontend/src/i18n/index.ts), ru/uk/pl are generated and committed ahead of translations (CA-10) shipping
import { writeFileSync } from "fs";
import { join } from "path";

import { ALLERGEN_SLUGS, CATEGORY_KEYS, UNIT_KEYS } from "./catalog.types";
import rawCatalogData from "./catalogData.json";
import { parseCatalogData } from "./catalogDataSchema";
import {
    ALLERGEN_NAMES,
    CATEGORY_NAMES,
    type Locale,
    LOCALES,
    UNIT_NAMES,
} from "./catalogVocabulary";

const catalogData = parseCatalogData(rawCatalogData);

function capitalize(value: string): string {
    return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

function ingredientNameFor(
    locale: Locale,
    entry: (typeof catalogData)[number],
): string | null {
    if (locale === "en") {
        return entry.nameEn;
    }

    const draftByLocale: Record<Exclude<Locale, "en">, string | null> = {
        ru: entry.nameRu,
        uk: entry.nameUk,
        pl: entry.namePl,
    };
    const draft = draftByLocale[locale];

    return draft ? capitalize(draft) : null;
}

interface LocaleResource {
    ingredient: Record<string, string>;
    unit: Record<string, string>;
    category: Record<string, string>;
    allergen: Record<string, string>;
}

function buildLocaleResource(locale: Locale): {
    resource: LocaleResource;
    missingIngredients: string[];
} {
    const ingredient: Record<string, string> = {};
    const missingIngredients: string[] = [];

    for (const entry of catalogData) {
        const name = ingredientNameFor(locale, entry);

        // no draft found for this language - omit the key rather than fabricate a translation; the resolver falls back to the raw DB name until this is filled in
        if (name === null) {
            missingIngredients.push(entry.slug);
            continue;
        }

        ingredient[entry.slug] = name;
    }

    const unit = Object.fromEntries(
        UNIT_KEYS.map((key) => [key, UNIT_NAMES[key][locale]]),
    );
    const category = Object.fromEntries(
        CATEGORY_KEYS.map((key) => [key, CATEGORY_NAMES[key][locale]]),
    );
    const allergen = Object.fromEntries(
        ALLERGEN_SLUGS.map((key) => [key, ALLERGEN_NAMES[key][locale]]),
    );

    return {
        resource: { ingredient, unit, category, allergen },
        missingIngredients,
    };
}

function reportLine(line: string): void {
    process.stderr.write(`${line}\n`);
}

function main(): void {
    const outputDir = join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "frontend",
        "src",
        "i18n",
        "locales",
    );

    for (const locale of LOCALES) {
        const { resource, missingIngredients } = buildLocaleResource(locale);
        const filePath = join(outputDir, locale, "catalog.json");

        writeFileSync(filePath, `${JSON.stringify(resource, null, 4)}\n`);

        reportLine(
            `${locale}: ${Object.keys(resource.ingredient).length}/${catalogData.length} ingredient names (${missingIngredients.length} missing)`,
        );
    }
}

main();
