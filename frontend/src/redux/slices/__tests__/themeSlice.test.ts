import { THEME_STORAGE_KEY } from "constants/theme";

import {
    getInitialThemeMode,
    setTheme,
    themeReducer,
    toggleTheme,
} from "redux/slices/themeSlice";

const stubMatchMedia = (matches: boolean): void => {
    window.matchMedia = (query: string): MediaQueryList => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    });
};

describe("getInitialThemeMode", () => {
    // must run before any test stubs window.matchMedia, so jsdom's real
    // lack of matchMedia support drives this branch
    it("should return dark when there is no stored preference and no matchMedia support", () => {
        expect(getInitialThemeMode()).toBe("dark");
    });

    it("should return the stored theme when one is persisted", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "light");

        expect(getInitialThemeMode()).toBe("light");
    });

    it("should ignore an invalid stored value and fall back to the OS preference", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "not-a-theme");
        stubMatchMedia(true);

        expect(getInitialThemeMode()).toBe("light");
    });

    it("should return light when the OS prefers a light color scheme", () => {
        stubMatchMedia(true);

        expect(getInitialThemeMode()).toBe("light");
    });

    it("should return dark when the OS prefers a dark color scheme", () => {
        stubMatchMedia(false);

        expect(getInitialThemeMode()).toBe("dark");
    });
});

describe("themeReducer", () => {
    it("should set the theme to the given mode", () => {
        const state = themeReducer({ mode: "dark" }, setTheme("light"));

        expect(state.mode).toBe("light");
    });

    it("should toggle from dark to light", () => {
        const state = themeReducer({ mode: "dark" }, toggleTheme());

        expect(state.mode).toBe("light");
    });

    it("should toggle from light to dark", () => {
        const state = themeReducer({ mode: "light" }, toggleTheme());

        expect(state.mode).toBe("dark");
    });
});
