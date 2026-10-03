import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsHydrated } from "hooks/useIsHydrated";

import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";
import {
    isEntryUnseen,
    readLastSeenDate,
    writeLastSeenDate,
} from "utils/newsReadState";

export const useNewsBadge = () => {
    const isHydrated = useIsHydrated();
    const { t } = useTranslation();
    const [storedDate, setStoredDate] = useState<string | null>(null);

    // the seen date is browser-only: read once hydrated, during render so the badge doesn't flash
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
