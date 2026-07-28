// dev-time only: builds catalogData.json from catalogMap against local nutrition/translation dumps (paths as argv, not committed) - run without args for usage
import rawCatalogMap from "./catalogMap.json";
import { parseCatalogMap } from "./catalogMapSchema";
import { loadEnergyByFdcId, loadFoodDescriptions } from "./nutritionSource";
import {
    buildCatalogEntry,
    type CatalogDataEntry,
} from "./resolveCatalogEntry";
import { loadTranslations } from "./translationSource";

// stdout is reserved for the generated JSON (see main()) - all other output goes to stderr
function reportLine(line: string): void {
    process.stderr.write(`${line}\n`);
}

function reportCoverage(
    data: CatalogDataEntry[],
    implausibleSlugs: string[],
): void {
    const missingCalories = data.filter(
        (entry) => entry.caloriesPerUnit === null,
    );
    const missingTranslations = data.filter(
        (entry) => ![entry.nameRu, entry.nameUk, entry.namePl].every(Boolean),
    );

    reportLine(
        `Catalog build: ${data.length} ingredients, ${data.length - missingCalories.length} with calories (${missingCalories.length} missing), ${data.length - missingTranslations.length} fully translated ru+uk+pl (${missingTranslations.length} still missing at least one language after overrides).`,
    );
    if (missingCalories.length > 0) {
        reportLine(
            `Missing calories: ${missingCalories.map((entry) => entry.slug).join(", ")}`,
        );
    }
    if (missingTranslations.length > 0) {
        reportLine(
            `Still missing a translation after overrides: ${missingTranslations.map((entry) => entry.slug).join(", ")}`,
        );
    }
    if (implausibleSlugs.length > 0) {
        reportLine(
            `Implausible calories (outside ~0.1-9 kcal/g), check the source match: ${implausibleSlugs.join(", ")}`,
        );
    }
}

function buildCatalogData(
    foodCsvDir: string,
    translationsFile: string,
): CatalogDataEntry[] {
    const energyByFdcId = loadEnergyByFdcId(foodCsvDir);
    const descriptionByFdcId = loadFoodDescriptions(foodCsvDir);
    const translations = loadTranslations(translationsFile);
    const catalogMap = parseCatalogMap(rawCatalogMap);
    const implausibleSlugs: string[] = [];

    const data = catalogMap.map((item) =>
        buildCatalogEntry(
            item,
            descriptionByFdcId,
            energyByFdcId,
            translations,
            implausibleSlugs,
        ),
    );

    // the generated catalog goes to stdout (see main()), so the coverage report goes to stderr
    reportCoverage(data, implausibleSlugs);

    return data;
}

function main(): void {
    const [foodCsvDir, translationsFile] = process.argv.slice(2);

    if (!foodCsvDir || !translationsFile) {
        reportLine(
            "usage: tsx src/scripts/catalog/buildCatalogData.ts <foodCsvDir> <translationsFile>",
        );
        process.exitCode = 1;

        return;
    }

    const data = buildCatalogData(foodCsvDir, translationsFile);

    process.stdout.write(`${JSON.stringify(data, null, 4)}\n`);
}

main();
