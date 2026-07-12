// pre-paint theme bootstrap.
const THEME_STORAGE_KEY = "theme";

const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
const theme =
    storedTheme === "light" || (storedTheme === null && prefersLight)
        ? "light"
        : "dark";
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

document.documentElement.dataset.theme = theme;
themeColorMeta.setAttribute("content", themeColorMeta.dataset[theme]);
