import { useEffect } from "react";

import { THEME_STORAGE_KEY } from "constants/theme";

import { useTheme } from "hooks/useTheme";

// mirrors the active theme's --bg into every <meta name="theme-color"> so the
// browser chrome (status bar, address bar) follows the theme on Android and
// older iOS; reads the computed value - _tokens.scss stays the single source.
// the theme itself only ever changes via a full reload (see ThemeToggle +
// ThemeChangeConfirmModal), so this is a load-time sync, not a live one
const syncThemeColorMeta = () => {
    const background = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim();

    if (!background) {
        return;
    }

    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.setAttribute("content", background);
    });
};

// renders nothing; syncs <html data-theme>, localStorage and the browser
// chrome color with the theme slice
export const ThemeManager = () => {
    const { mode } = useTheme();

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        syncThemeColorMeta();
    }, [mode]);

    return null;
};
