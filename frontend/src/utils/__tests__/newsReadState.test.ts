import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";
import {
    isEntryUnseen,
    readLastSeenDate,
    writeLastSeenDate,
} from "utils/newsReadState";

const LATEST_RELEASE_DATE = getLatestReleaseDate();
const previousRelease = getNewsItems().find(
    (entry) => entry.date !== LATEST_RELEASE_DATE,
);

if (!previousRelease) {
    throw new Error("expected news items to span more than one release");
}

const PREVIOUS_RELEASE_DATE = previousRelease.date;

describe("readLastSeenDate", () => {
    it("should default to just before the latest release when nothing is stored", () => {
        expect(readLastSeenDate()).toBe(PREVIOUS_RELEASE_DATE);
    });

    it("should return the stored date once written", () => {
        writeLastSeenDate(LATEST_RELEASE_DATE);

        expect(readLastSeenDate()).toBe(LATEST_RELEASE_DATE);
    });
});

describe("isEntryUnseen", () => {
    it("should be true when the entry is newer than the last-seen date", () => {
        expect(
            isEntryUnseen({ date: LATEST_RELEASE_DATE }, PREVIOUS_RELEASE_DATE),
        ).toBe(true);
    });

    it("should be false when the entry is at or before the last-seen date", () => {
        expect(
            isEntryUnseen({ date: PREVIOUS_RELEASE_DATE }, LATEST_RELEASE_DATE),
        ).toBe(false);
    });
});
