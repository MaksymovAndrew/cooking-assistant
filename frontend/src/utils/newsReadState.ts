import type { NewsEntry } from "utils/newsItems";
import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";

const STORAGE_KEY = "cooking.newsLastSeen";

// showing every historical entry as "unseen" would be noisy, so a fresh account defaults to just before the latest release, marking only that one new
const getDefaultLastSeenDate = (): string => {
    const latestReleaseDate = getLatestReleaseDate();

    return (
        getNewsItems().find((entry) => entry.date !== latestReleaseDate)
            ?.date ?? latestReleaseDate
    );
};

export const readLastSeenDate = (): string =>
    localStorage.getItem(STORAGE_KEY) ?? getDefaultLastSeenDate();

export const writeLastSeenDate = (date: string): void => {
    localStorage.setItem(STORAGE_KEY, date);
};

export const isEntryUnseen = (
    entry: Pick<NewsEntry, "date">,
    lastSeenDate: string,
): boolean => entry.date > lastSeenDate;
