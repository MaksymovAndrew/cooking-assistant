import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsHydrated } from "hooks/useIsHydrated";

import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";
import {
    isEntryUnseen,
    readLastSeenDate,
    writeLastSeenDate,
} from "utils/newsReadState";

// tracks which news items the user hasn't opened the popup since - unlike a static "is this from the latest release" flag, the badge actually clears
export const useNewsBadge = () => {
    const isHydrated = useIsHydrated();
    const { t } = useTranslation();
    const [storedDate, setStoredDate] = useState<string | null>(null);

    // what the user has already seen is a browser-only fact, and the server renders this page
    // now: reading it any earlier would both crash the render and make the first client render
    // disagree. Adjusted during render, not in an effect, so the badge appears once instead of
    // flashing on and off
    if (isHydrated && storedDate === null) {
        setStoredDate(readLastSeenDate(t));
    }

    // nothing counts as unseen until the stored date is known
    const lastSeenDate = storedDate ?? getLatestReleaseDate(t);
    const unseenCount = getNewsItems(t).filter((entry) =>
        isEntryUnseen(entry, lastSeenDate),
    ).length;

    const markAllSeen = () => {
        const latestReleaseDate = getLatestReleaseDate(t);

        writeLastSeenDate(latestReleaseDate);
        setStoredDate(latestReleaseDate);
    };

    return { lastSeenDate, unseenCount, markAllSeen };
};
