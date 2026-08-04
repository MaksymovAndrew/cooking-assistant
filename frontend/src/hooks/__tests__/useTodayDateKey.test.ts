import { act, renderHook } from "@testing-library/react";

import { useTodayDateKey } from "hooks/useTodayDateKey";

const NOW = new Date(2026, 0, 14, 23, 59, 0);

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("useTodayDateKey", () => {
    it("should return today's date key", () => {
        const { result } = renderHook(() => useTodayDateKey());

        expect(result.current).toBe(NOW.toDateString());
    });

    it("should update once local midnight passes", () => {
        const { result } = renderHook(() => useTodayDateKey());

        expect(result.current).toBe(new Date(2026, 0, 14).toDateString());

        act(() => {
            jest.setSystemTime(new Date(2026, 0, 15, 0, 0, 1));
            jest.advanceTimersByTime(60 * 1000);
        });

        expect(result.current).toBe(new Date(2026, 0, 15).toDateString());
    });

    it("should re-sync on tab focus in case the midnight timer was throttled", () => {
        const { result } = renderHook(() => useTodayDateKey());

        act(() => {
            jest.setSystemTime(new Date(2026, 0, 16, 8, 0, 0));
            document.dispatchEvent(new Event("visibilitychange"));
        });

        expect(result.current).toBe(new Date(2026, 0, 16).toDateString());
    });
});
