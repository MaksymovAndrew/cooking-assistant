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

// news.json lists items newest-first, and string-key order survives Object.entries
export const getNewsItems = (t: TFunction): NewsEntry[] => {
    const items = t("news:items", {
        returnObjects: true,
    }) as Record<string, RawNewsItem>;

    return Object.entries(items).map(([id, entry]) => ({ id, ...entry }));
};

export const getLatestReleaseDate = (t: TFunction): string =>
    getNewsItems(t)[0].date;
