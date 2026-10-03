import { Moon, Sun } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useTheme } from "hooks/useTheme";

import { cx } from "utils/cx";

import styles from "./ThemeToggle.module.scss";

const ICON_SIZE = 17;

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const dispatch = useAppDispatch();
    // on screen from the server render; until React hydrates this opens nothing
    const isHydrated = useIsHydrated();

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
            disabled={!isHydrated}
            aria-label={t("theme.toggleLabel")}
            className={cx(styles["theme-toggle"], className)}
        >
            <Moon
                size={ICON_SIZE}
                aria-hidden="true"
                className={styles["icon--dark"]}
            />
            <Sun
                size={ICON_SIZE}
                aria-hidden="true"
                className={styles["icon--light"]}
            />
        </button>
    );
};
