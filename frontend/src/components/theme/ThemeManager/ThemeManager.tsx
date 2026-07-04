import { useEffect } from "react";

import { THEME_STORAGE_KEY } from "constants/theme";

import { useTheme } from "hooks/useTheme";

// mirrors --bg into <meta name="theme-color"> so Android/older iOS browser chrome follows the theme
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

export const ThemeManager = () => {
    const { mode } = useTheme();

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        syncThemeColorMeta();
    }, [mode]);

    return null;
};
