import { useEffect } from "react";

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

// persistence is owned by ThemeChangeConfirmModal - this only ever applies the resolved mode to the DOM, never writes storage itself
export const ThemeManager = () => {
    const { mode } = useTheme();

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        syncThemeColorMeta();
    }, [mode]);

    return null;
};
