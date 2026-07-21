import { useEffect } from "react";

import { useAppDispatch } from "redux/hooks";
import { getStoredThemeChoice, setTheme } from "redux/slices/themeSlice";

import { useMediaQuery } from "hooks/useMediaQuery";
import { useTheme } from "hooks/useTheme";

// same query themeSlice's prefersLightScheme() resolves at store init, so the live-sync fallback (no matchMedia support) matches the initial-load fallback
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

// persistence is owned by ThemeChangeConfirmModal - this only ever applies the resolved mode to the DOM, never writes storage itself
export const ThemeManager = () => {
    const dispatch = useAppDispatch();
    const { mode } = useTheme();
    const prefersLight = useMediaQuery(PREFERS_LIGHT_QUERY);

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        syncThemeColorMeta();
    }, [mode]);

    // live-follows the OS scheme while the tab stays open, but only when the user hasn't picked an explicit mode in Settings
    useEffect(() => {
        if (getStoredThemeChoice() === "system") {
            dispatch(setTheme(prefersLight ? "light" : "dark"));
        }
    }, [prefersLight, dispatch]);

    return null;
};
