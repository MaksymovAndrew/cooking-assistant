import { THEME_STORAGE_KEY } from "constants/theme";

import { ThemeManager } from "components/theme/ThemeManager";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const appendThemeColorMeta = (): HTMLMetaElement => {
    const meta = document.createElement("meta");

    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);

    return meta;
};

describe("ThemeManager", () => {
    afterEach(() => {
        document.documentElement.style.removeProperty("--bg");
        document
            .querySelectorAll('meta[name="theme-color"]')
            .forEach((node) => {
                node.remove();
            });
    });

    it("should set the html data-theme attribute and persist the mode", () => {
        const store = makeTestStore({ theme: { mode: "light" } });

        renderWithProviders(<ThemeManager />, { store });

        expect(document.documentElement.dataset.theme).toBe("light");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("should mirror the theme background into the theme-color metas", () => {
        const meta = appendThemeColorMeta();

        document.documentElement.style.setProperty("--bg", "#15131a");

        renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(meta.getAttribute("content")).toBe("#15131a");
    });

    it("should leave the theme-color metas untouched when --bg is not defined", () => {
        const meta = appendThemeColorMeta();

        meta.setAttribute("content", "#f7f5fb");

        renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(meta.getAttribute("content")).toBe("#f7f5fb");
    });

    it("should render nothing", () => {
        const { container } = renderWithProviders(<ThemeManager />, {
            store: makeTestStore({ theme: { mode: "dark" } }),
        });

        expect(container).toBeEmptyDOMElement();
    });
});
