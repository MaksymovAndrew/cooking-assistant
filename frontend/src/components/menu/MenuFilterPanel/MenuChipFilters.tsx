import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterChipGroup } from "components/ui/FilterChipGroup";
import { LanguageFilterChips } from "components/ui/LanguageFilterChips";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";
import { menuCategoryName } from "utils/referenceLabels";

import styles from "./MenuFilterPanel.module.scss";

interface MenuChipFiltersProps {
    filters: MenuFilterState;
    setValue: SetFilterValue<MenuFilterState>;
    categories: MenuCategory[];
}

export const MenuChipFilters: React.FC<MenuChipFiltersProps> = ({
    filters,
    setValue,
    categories,
}) => {
    const { t } = useTranslation("menu");

    return (
        <>
            <div className={styles["menu-filter-panel__section"]}>
                <span className={styles["menu-filter-panel__label"]}>
                    {t("categoryFilter.categoryLabel")}
                </span>
                <FilterChipGroup
                    options={categories.map((category) => ({
                        id: category.menu_category_id,
                        label: menuCategoryName(t, category.category_name),
                    }))}
                    value={filters.categories}
                    onChange={(next) => {
                        setValue("categories", next);
                    }}
                />
            </div>
            <div className={styles["menu-filter-panel__section"]}>
                <span className={styles["menu-filter-panel__label"]}>
                    {t("common:contentLanguage.filterLabel")}
                </span>
                <LanguageFilterChips
                    value={filters.languages}
                    onChange={(next) => {
                        setValue("languages", next);
                    }}
                />
            </div>
        </>
    );
};
