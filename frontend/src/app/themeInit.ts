import { THEME_STORAGE_KEY } from "constants/theme";

const THEME_COLORS = {
    dark: process.env.THEME_COLOR_DARK,
    light: process.env.THEME_COLOR_LIGHT,
};

// applies the theme before first paint; the colours are the design tokens, injected at build time
export const themeInitScript = `(() => {
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = stored === "light" || (stored === null && prefersLight) ? "light" : "dark";
    const colors = ${JSON.stringify(THEME_COLORS)};

    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", colors[theme]));
})();`;
