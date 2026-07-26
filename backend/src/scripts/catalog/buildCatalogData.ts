// dev-time only: converts the hand-curated catalogMap into the committed catalogData.json,
// resolving calories-per-unit and ru/uk/pl draft names against two local nutrition/translation
// dumps (paths given as argv, not committed).
//
// usage: tsx src/scripts/catalog/buildCatalogData.ts <foodCsvDir> <translationsFile>
//   <foodCsvDir>        directory containing food.csv and food_nutrient.csv (nutrition dump, 2018-04 release)
//   <translationsFile>  ingredients taxonomy text file (translation dump)
import rawCatalogMap from "./catalogMap.json";
import { parseCatalogMap } from "./catalogMapSchema";
import { loadEnergyByFdcId, loadFoodDescriptions } from "./nutritionSource";
import {
    buildCatalogEntry,
    type CatalogDataEntry,
} from "./resolveCatalogEntry";
import { loadTranslations } from "./translationSource";

// stdout is reserved for the generated file content (see main()); all developer-facing
// progress/report output goes to stderr instead
function reportLine(line: string): void {
    process.stderr.write(`${line}\n`);
}

function reportCoverage(data: CatalogDataEntry[]): void {
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
}

function buildCatalogData(
    foodCsvDir: string,
    translationsFile: string,
): CatalogDataEntry[] {
    const energyByFdcId = loadEnergyByFdcId(foodCsvDir);
    const descriptionByFdcId = loadFoodDescriptions(foodCsvDir);
    const translations = loadTranslations(translationsFile);
    const catalogMap = parseCatalogMap(rawCatalogMap);

    const data = catalogMap.map((item) =>
        buildCatalogEntry(
            item,
            descriptionByFdcId,
            energyByFdcId,
            translations,
        ),
    );

    // the generated catalog goes to stdout (see main()), so the coverage report goes to stderr
    reportCoverage(data);

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
