import { act, renderHook } from "@testing-library/react";

import { useOnlineStatus } from "hooks/useOnlineStatus";

const setNavigatorOnLine = (value: boolean) => {
    Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value,
    });
};

describe("useOnlineStatus", () => {
    afterEach(() => {
        setNavigatorOnLine(true);
    });

    it("should reflect navigator.onLine on mount", () => {
        setNavigatorOnLine(false);

        const { result } = renderHook(() => useOnlineStatus());

        expect(result.current).toBe(false);
    });

    it("should flip to false when the offline event fires", () => {
        const { result } = renderHook(() => useOnlineStatus());

        act(() => {
            window.dispatchEvent(new Event("offline"));
        });

        expect(result.current).toBe(false);
    });

    it("should flip back to true when the online event fires", () => {
        const { result } = renderHook(() => useOnlineStatus());

        act(() => {
            window.dispatchEvent(new Event("offline"));
        });
        act(() => {
            window.dispatchEvent(new Event("online"));
        });

        expect(result.current).toBe(true);
    });
});
