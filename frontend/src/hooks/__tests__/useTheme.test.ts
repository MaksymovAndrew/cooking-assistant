import { act } from "@testing-library/react";

import { useTheme } from "hooks/useTheme";

import { makeTestStore, renderHookWithStore } from "test/store";

describe("useTheme", () => {
    it("should expose the current mode and isDark flag", () => {
        const store = makeTestStore({ theme: { mode: "dark" } });
        const { result } = renderHookWithStore(() => useTheme(), store);

        expect(result.current.mode).toBe("dark");
        expect(result.current.isDark).toBe(true);
    });

    it("should toggle the theme", () => {
        const store = makeTestStore({ theme: { mode: "dark" } });
        const { result } = renderHookWithStore(() => useTheme(), store);

        act(() => {
            result.current.toggle();
        });

        expect(result.current.mode).toBe("light");
        expect(result.current.isDark).toBe(false);
    });

    it("should set the theme to a specific mode", () => {
        const store = makeTestStore({ theme: { mode: "dark" } });
        const { result } = renderHookWithStore(() => useTheme(), store);

        act(() => {
            result.current.setTheme("light");
        });

        expect(result.current.mode).toBe("light");
    });
});
