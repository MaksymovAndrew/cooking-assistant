import type { TFunction } from "i18next";

export interface NewsEntry {
    id: string;
    date: string;
    title: string;
    description: string;
}

interface RawNewsItem {
    date: string;
    title: string;
    description: string;
}

// news.json's "items" is authored newest-first; object key order is preserved for string keys, so this stays in that same order without re-sorting
export const getNewsItems = (t: TFunction): NewsEntry[] => {
    const items = t("news:items", {
        returnObjects: true,
    }) as Record<string, RawNewsItem>;

    return Object.entries(items).map(([id, entry]) => ({ id, ...entry }));
};

// getNewsItems() is ordered newest-first, so its first entry is always the latest release
export const getLatestReleaseDate = (t: TFunction): string =>
    getNewsItems(t)[0].date;
