import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { THEME_STORAGE_KEY } from "constants/theme";

export type ThemeMode = "dark" | "light";

// "system" isn't a renderable mode itself - it means "no stored override, resolve from prefers-color-scheme"
export type ThemeChoice = ThemeMode | "system";

const prefersLightScheme = (): boolean =>
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

// persisted choice wins; otherwise the OS preference decides the first visit
export const getInitialThemeMode = (): ThemeMode => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
        return stored;
    }

    return prefersLightScheme() ? "light" : "dark";
};

// the Settings segmented control's active option - "system" when nothing is stored, regardless of what that currently resolves to
export const getStoredThemeChoice = (): ThemeChoice => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    return stored === "dark" || stored === "light" ? stored : "system";
};

interface ThemeState {
    mode: ThemeMode;
}

const initialState: ThemeState = { mode: getInitialThemeMode() };

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
        toggleTheme: (state) => {
            state.mode = state.mode === "dark" ? "light" : "dark";
        },
    },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
