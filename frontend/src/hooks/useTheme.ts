import { useAppDispatch, useAppSelector } from "redux/hooks";
import { selectIsDark, selectThemeMode } from "redux/selectors/themeSelectors";
import type { ThemeMode } from "redux/slices/themeSlice";
import { setTheme, toggleTheme } from "redux/slices/themeSlice";

export const useTheme = () => {
    const dispatch = useAppDispatch();
    const mode = useAppSelector(selectThemeMode);
    const isDark = useAppSelector(selectIsDark);

    return {
        mode,
        isDark,
        toggle: () => dispatch(toggleTheme()),
        setTheme: (next: ThemeMode) => dispatch(setTheme(next)),
    };
};
