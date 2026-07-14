import { act, renderHook } from "@testing-library/react";

import { useNewsBadge } from "hooks/useNewsBadge";

import { getLatestReleaseDate, getNewsItems } from "utils/newsItems";

const LATEST_RELEASE_DATE = getLatestReleaseDate();
const latestReleaseCount = getNewsItems().filter(
    (entry) => entry.date === LATEST_RELEASE_DATE,
).length;

describe("useNewsBadge", () => {
    it("should count only the latest release as unseen for a first-time visitor", () => {
        const { result } = renderHook(() => useNewsBadge());

        expect(result.current.unseenCount).toBe(latestReleaseCount);
    });

    it("should clear the unseen count after markAllSeen", () => {
        const { result } = renderHook(() => useNewsBadge());

        act(() => {
            result.current.markAllSeen();
        });

        expect(result.current.unseenCount).toBe(0);
        expect(result.current.lastSeenDate).toBe(LATEST_RELEASE_DATE);
    });

    it("should stay cleared across a remount once seen is persisted", () => {
        const { result: firstResult } = renderHook(() => useNewsBadge());

        act(() => {
            firstResult.current.markAllSeen();
        });

        const { result: secondResult } = renderHook(() => useNewsBadge());

        expect(secondResult.current.unseenCount).toBe(0);
    });
});
