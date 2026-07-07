import { useState } from "react";

import { LATEST_RELEASE_DATE, NEWS_ITEMS } from "constants/news";

import {
    isEntryUnseen,
    readLastSeenDate,
    writeLastSeenDate,
} from "utils/newsReadState";

// tracks which NEWS_ITEMS the user hasn't opened the popup since - unlike a
// static "is this from the latest release" flag, the badge actually clears
export const useNewsBadge = () => {
    const [lastSeenDate, setLastSeenDate] = useState(readLastSeenDate);

    const unseenCount = NEWS_ITEMS.filter((entry) =>
        isEntryUnseen(entry, lastSeenDate),
    ).length;

    const markAllSeen = () => {
        writeLastSeenDate(LATEST_RELEASE_DATE);
        setLastSeenDate(LATEST_RELEASE_DATE);
    };

    return { lastSeenDate, unseenCount, markAllSeen };
};
