import type { RootState } from "redux/store";

export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectIsDark = (state: RootState) => state.theme.mode === "dark";
