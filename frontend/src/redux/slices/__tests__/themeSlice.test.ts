import { THEME_STORAGE_KEY } from "constants/theme";

import { getInitialThemeMode, storeThemeChoice } from "redux/slices/themeSlice";

// undefined under jsdom, so restoring it brings back a browser without matchMedia
const originalMatchMedia = window.matchMedia;

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

afterEach(() => {
    window.matchMedia = originalMatchMedia;
});

describe("getInitialThemeMode", () => {
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

describe("storeThemeChoice", () => {
    it("should store an explicit theme", () => {
        storeThemeChoice("light");

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("should clear the stored theme for the system choice", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");

        storeThemeChoice("system");

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    });
});
