export interface NewsEntry {
    id: string;
    // release date from the root CHANGELOG.md, as an ISO date
    date: string;
    isNew: boolean;
}

const RELEASE_3_3_DATE = "2026-07-02";

// the "What's new" feed - every entry must describe a real shipped release
// (see CHANGELOG.md); when a release ships, add its entries here with
// isNew: true and clear the flag on the previous release's entries
export const NEWS_ITEMS: readonly NewsEntry[] = [
    { id: "redesign", date: RELEASE_3_3_DATE, isNew: true },
    { id: "pantryAware", date: RELEASE_3_3_DATE, isNew: true },
    { id: "statsCharts", date: RELEASE_3_3_DATE, isNew: true },
    { id: "lockout", date: "2026-06-27", isNew: false },
    { id: "instantUpdates", date: "2026-06-26", isNew: false },
    { id: "launch", date: "2026-06-21", isNew: false },
    { id: "fasterLoads", date: "2026-06-20", isNew: false },
    { id: "privateMenus", date: "2026-06-20", isNew: false },
];

export const NEW_NEWS_COUNT = NEWS_ITEMS.filter((entry) => entry.isNew).length;
