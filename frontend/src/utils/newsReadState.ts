import type { NewsEntry } from "constants/news";
import { LATEST_RELEASE_DATE, NEWS_ITEMS } from "constants/news";

const STORAGE_KEY = "cooking.newsLastSeen";

// a first-time visitor hasn't seen anything, but showing every historical
// entry as "unseen" would be noisy - default to just before the latest
// release, so a fresh account starts with only that release marked new
const DEFAULT_LAST_SEEN_DATE =
    NEWS_ITEMS.find((entry) => entry.date !== LATEST_RELEASE_DATE)?.date ??
    LATEST_RELEASE_DATE;

export const readLastSeenDate = (): string =>
    localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LAST_SEEN_DATE;

export const writeLastSeenDate = (date: string): void => {
    localStorage.setItem(STORAGE_KEY, date);
};

export const isEntryUnseen = (
    entry: NewsEntry,
    lastSeenDate: string,
): boolean => entry.date > lastSeenDate;
