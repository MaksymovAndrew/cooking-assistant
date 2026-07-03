import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useTheme } from "hooks/useTheme";

import styles from "./ThemeToggle.module.scss";

const ICON_SIZE = 17;

export const ThemeToggle: React.FC = () => {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(
            openModal({
                type: MODAL_TYPE.themeChange,
                nextMode: isDark ? "light" : "dark",
            }),
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={t("theme.toggleLabel")}
            className={styles["theme-toggle"]}
        >
            {isDark ? <Moon size={ICON_SIZE} /> : <Sun size={ICON_SIZE} />}
            <span>{isDark ? t("theme.dark") : t("theme.light")}</span>
        </button>
    );
};
