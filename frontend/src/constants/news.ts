export interface NewsEntry {
    id: string;
    // release date from the root CHANGELOG.md, as an ISO date
    date: string;
}

const RELEASE_3_3_DATE = "2026-07-02";

// the "What's new" feed - every entry must describe a real shipped release (see CHANGELOG.md)
export const NEWS_ITEMS: readonly NewsEntry[] = [
    { id: "redesign", date: "2026-07-12" },
    { id: "pantryAware", date: RELEASE_3_3_DATE },
    { id: "statsCharts", date: RELEASE_3_3_DATE },
    { id: "lockout", date: "2026-06-27" },
    { id: "instantUpdates", date: "2026-06-26" },
    { id: "launch", date: "2026-06-21" },
    { id: "fasterLoads", date: "2026-06-20" },
    { id: "privateMenus", date: "2026-06-20" },
];

// NEWS_ITEMS is ordered newest-first, so this is always the latest release
export const LATEST_RELEASE_DATE = NEWS_ITEMS[0].date;
