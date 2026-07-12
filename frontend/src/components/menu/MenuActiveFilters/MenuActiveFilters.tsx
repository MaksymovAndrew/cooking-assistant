import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./MenuActiveFilters.module.scss";

interface MenuActiveFiltersProps {
    total: number;
    selectedCategories: number[];
    setSelectedCategories: (categories: number[]) => void;
    searchQuery: string | null;
    removeSearch: () => void;
}

const REMOVE_ICON_SIZE = 12;

export const MenuActiveFilters: React.FC<MenuActiveFiltersProps> = ({
    total,
    selectedCategories,
    setSelectedCategories,
    searchQuery,
    removeSearch,
}) => {
    const { t } = useTranslation("menu");

    return (
        <div className={styles["menu-active-filters"]}>
            <span className={styles["menu-active-filters__count"]}>
                {t("categoryFilter.menuCount", { count: total })}
            </span>
            {searchQuery && (
                <>
                    <span className={styles["menu-active-filters__divider"]} />
                    <span className={styles["menu-active-filters__chip"]}>
                        {t("categoryFilter.searchChip", {
                            query: searchQuery,
                        })}
                        <button
                            type="button"
                            aria-label={t("categoryFilter.removeFilter")}
                            onClick={removeSearch}
                        >
                            <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                        </button>
                    </span>
                </>
            )}
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
