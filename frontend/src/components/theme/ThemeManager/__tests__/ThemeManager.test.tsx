import { act } from "@testing-library/react";

import { THEME_STORAGE_KEY } from "constants/theme";

import { ThemeManager } from "components/theme/ThemeManager";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const themeColorMetas: HTMLMetaElement[] = [];

const appendThemeColorMeta = (): HTMLMetaElement => {
    const meta = document.createElement("meta");

    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
    themeColorMetas.push(meta);

    return meta;
};

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

describe("ThemeManager", () => {
    afterEach(() => {
        document.documentElement.style.removeProperty("--bg");
        themeColorMetas.splice(0).forEach((meta) => {
            meta.remove();
        });
        localStorage.removeItem(THEME_STORAGE_KEY);
        // @ts-expect-error - restoring jsdom's default (no matchMedia)
        delete window.matchMedia;
    });

    it("should set the html data-theme attribute", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "light");
        const store = makeTestStore({ theme: { mode: "light" } });

        renderWithProviders(<ThemeManager />, { store });

        expect(document.documentElement.dataset.theme).toBe("light");
    });

    it("should mirror the theme background into the theme-color metas", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
        const meta = appendThemeColorMeta();

        document.documentElement.style.setProperty("--bg", "#15131a");

        renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(meta.getAttribute("content")).toBe("#15131a");
    });

    it("should leave the theme-color metas untouched when --bg is not defined", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
        const meta = appendThemeColorMeta();

        meta.setAttribute("content", "#f7f5fb");

        renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(meta.getAttribute("content")).toBe("#f7f5fb");
    });

    it("should render nothing", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");

        const { container } = renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(container).toBeEmptyDOMElement();
    });

    it("should live-sync the mode with the OS when the stored choice is system", () => {
        const media = mockMatchMedia(false);
        const store = makeTestStore({ theme: { mode: "dark" } });

        renderWithProviders(<ThemeManager />, { store });

        act(() => {
            media.change(true);
        });

        expect(store.getState().theme.mode).toBe("light");
    });

    it("should not override an explicit stored choice when the OS preference changes", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
        const media = mockMatchMedia(false);
        const store = makeTestStore({ theme: { mode: "dark" } });

        renderWithProviders(<ThemeManager />, { store });

        act(() => {
            media.change(true);
        });

        expect(store.getState().theme.mode).toBe("dark");
    });
});
