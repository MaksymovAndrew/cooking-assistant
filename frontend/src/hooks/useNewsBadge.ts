import { useState } from "react";

import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";
import {
    isEntryUnseen,
    readLastSeenDate,
    writeLastSeenDate,
} from "utils/newsReadState";

// tracks which news items the user hasn't opened the popup since - unlike a static "is this from the latest release" flag, the badge actually clears
export const useNewsBadge = () => {
    const [lastSeenDate, setLastSeenDate] = useState(readLastSeenDate);

    const unseenCount = getNewsItems().filter((entry) =>
        isEntryUnseen(entry, lastSeenDate),
    ).length;

    const markAllSeen = () => {
        const latestReleaseDate = getLatestReleaseDate();

        writeLastSeenDate(latestReleaseDate);
        setLastSeenDate(latestReleaseDate);
    };

    return { lastSeenDate, unseenCount, markAllSeen };
};
