import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { DEFAULT_THEME_MODE, THEME_STORAGE_KEY } from "constants/theme";

export type ThemeMode = "dark" | "light";

// "system" is no stored override: the mode resolves from prefers-color-scheme
export type ThemeChoice = ThemeMode | "system";

const prefersLightScheme = (): boolean =>
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

// browser-only: reads storage and the OS preference, so it never runs during a server render
export const getInitialThemeMode = (): ThemeMode => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
        return stored;
    }

    return prefersLightScheme() ? "light" : "dark";
};

export const getStoredThemeChoice = (): ThemeChoice => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    return stored === "dark" || stored === "light" ? stored : "system";
};

export const storeThemeChoice = (choice: ThemeChoice): void => {
    if (choice === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);

        return;
    }

    localStorage.setItem(THEME_STORAGE_KEY, choice);
};

interface ThemeState {
    mode: ThemeMode;
}

// the browser's mode arrives as preloaded state from createStore
const initialState: ThemeState = { mode: DEFAULT_THEME_MODE };

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
