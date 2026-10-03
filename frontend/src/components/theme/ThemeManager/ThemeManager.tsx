import { useEffect, useLayoutEffect } from "react";

import { useAppDispatch } from "redux/hooks";
import { getStoredThemeChoice, setTheme } from "redux/slices/themeSlice";

import { useMediaQuery } from "hooks/useMediaQuery";
import { useTheme } from "hooks/useTheme";

// must match themeSlice's prefersLightScheme(), so live sync and initial load agree
const PREFERS_LIGHT_QUERY = "(prefers-color-scheme: light)";

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

// never writes storage: ThemeChangeConfirmModal owns persistence
export const ThemeManager = () => {
    const dispatch = useAppDispatch();
    const { mode } = useTheme();
    const prefersLight = useMediaQuery(PREFERS_LIGHT_QUERY);

    // before paint: a 404's client render rebuilds <html> without the pre-paint data-theme
    useLayoutEffect(() => {
        document.documentElement.dataset.theme = mode;
        syncThemeColorMeta();
    }, [mode]);

    useEffect(() => {
        if (getStoredThemeChoice() === "system") {
            dispatch(setTheme(prefersLight ? "light" : "dark"));
        }
    }, [prefersLight, dispatch]);

    return null;
};
