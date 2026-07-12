import { act, renderHook } from "@testing-library/react";

import { useMediaQuery } from "hooks/useMediaQuery";

const QUERY = "(max-width: 767px)";

const mockMatchMedia = (matches: boolean) => {
    const listeners: ((event: { matches: boolean }) => void)[] = [];
    const mql = {
        matches,
        addEventListener: (_event: string, listener: () => void) => {
            listeners.push(listener);
        },
        removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(mql);

    return {
        change: (nextMatches: boolean) => {
            mql.matches = nextMatches;
            listeners.forEach((listener) => {
                listener({ matches: nextMatches });
            });
        },
    };
};

describe("useMediaQuery", () => {
    afterEach(() => {
        // @ts-expect-error - restoring jsdom's default (no matchMedia)
        delete window.matchMedia;
    });

    it("should return false when matchMedia is unavailable", () => {
        const { result } = renderHook(() => useMediaQuery(QUERY));

        expect(result.current).toBe(false);
    });

    it("should reflect the initial match state", () => {
        mockMatchMedia(true);

        const { result } = renderHook(() => useMediaQuery(QUERY));

        expect(result.current).toBe(true);
    });

    it("should update when the media query match changes", () => {
        const media = mockMatchMedia(false);
        const { result } = renderHook(() => useMediaQuery(QUERY));

        expect(result.current).toBe(false);

        act(() => {
            media.change(true);
        });

        expect(result.current).toBe(true);
    });
});
