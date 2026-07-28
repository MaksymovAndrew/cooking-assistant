import { readFileSync } from "fs";

export interface Translation {
    ru: string | null;
    uk: string | null;
    pl: string | null;
}

const TRANSLATED_LANGUAGES = ["ru", "uk", "pl"] as const;

// blocks are separated by blank lines; each holds "en: name, synonyms" plus one line per language
export function loadTranslations(
    translationsFile: string,
): Map<string, Translation> {
    const text = readFileSync(translationsFile, "utf8");
    const blocks = text.split(/\n\s*\n/);
    const translationsByEnName = new Map<string, Translation>();

    for (const block of blocks) {
        const lines = block.split("\n").map((line) => line.trim());
        const enLine = lines.find((line) => line.startsWith("en:"));

        if (!enLine) {
            continue;
        }

        const enNames = enLine
            .slice("en:".length)
            .split(",")
            .map((name) => name.trim().toLowerCase())
            .filter(Boolean);
        const translation = readTranslationLines(lines);

        for (const name of enNames) {
            translationsByEnName.set(name, translation);
        }
    }

    return translationsByEnName;
}

function readTranslationLines(lines: string[]): Translation {
    const translation: Translation = { ru: null, uk: null, pl: null };

    for (const lang of TRANSLATED_LANGUAGES) {
        const line = lines.find((entryLine) =>
            entryLine.startsWith(`${lang}:`),
        );

        if (line) {
            const [firstName] = line
                .slice(`${lang}:`.length)
                .split(",")
                .map((name) => name.trim());

            translation[lang] = firstName || null;
        }
    }

    return translation;
}
