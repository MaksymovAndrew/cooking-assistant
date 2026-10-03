import { useAppSelector } from "redux/hooks";
import { selectIsDark, selectThemeMode } from "redux/selectors/themeSelectors";

export const useTheme = () => {
    const mode = useAppSelector(selectThemeMode);
    const isDark = useAppSelector(selectIsDark);

    return { mode, isDark };
};
