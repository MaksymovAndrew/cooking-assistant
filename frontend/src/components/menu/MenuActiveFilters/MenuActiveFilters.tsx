import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./MenuActiveFilters.module.scss";

interface MenuActiveFiltersProps {
    total: number;
    selectedCategories: number[];
    setSelectedCategories: (categories: number[]) => void;
}

export const MenuActiveFilters: React.FC<MenuActiveFiltersProps> = ({
    total,
    selectedCategories,
    setSelectedCategories,
}) => {
    const { t } = useTranslation("menu");

    return (
        <div className={styles["menu-active-filters"]}>
            <span className={styles["menu-active-filters__count"]}>
                {t("categoryFilter.menuCount", { count: total })}
            </span>
            {selectedCategories.length > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCategories([]);
                    }}
                    className={styles["menu-active-filters__clear"]}
                >
                    {t("categoryFilter.reset")}
                </button>
            )}
        </div>
    );
};
