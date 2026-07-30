import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterChipGroup } from "components/ui/FilterChipGroup";
import { FilterPanel } from "components/ui/FilterPanel";
import { SearchComponent } from "components/ui/SearchComponent";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";

import styles from "./MenuFilterPanel.module.scss";

export interface MenuFilterPanelProps {
    filters: MenuFilterState;
    setValue: SetFilterValue<MenuFilterState>;
    resetFilters: () => void;
    activeCount: number;
    categories: MenuCategory[];
    searchPlaceholder: string;
    total: number;
}

export const MenuFilterPanel: React.FC<MenuFilterPanelProps> = ({
    filters,
    setValue,
    resetFilters,
    activeCount,
    categories,
    searchPlaceholder,
    total,
}) => {
    const { t } = useTranslation("menu");
    const showResultsLabel = t("categoryFilter.showResults", { count: total });

    return (
        <div className={styles["menu-filter-panel"]}>
            <SearchComponent
                placeholder={searchPlaceholder}
                value={filters.search}
                onSubmit={(value) => {
                    setValue("search", value);
                }}
            />
            <FilterPanel
                title={t("categoryFilter.filter")}
                closeLabel={t("categoryFilter.close")}
                resetLabel={t("categoryFilter.reset")}
                applyAriaLabel={showResultsLabel}
                applyMobileLabel={showResultsLabel}
                applyDesktopLabel={t("categoryFilter.apply")}
                activeCount={activeCount}
                onReset={resetFilters}
            >
                <div className={styles["menu-filter-panel__section"]}>
                    <span className={styles["menu-filter-panel__label"]}>
                        {t("categoryFilter.categoryLabel")}
                    </span>
                    <FilterChipGroup
                        options={categories.map((category) => ({
                            id: category.menu_category_id,
                            label: category.category_name,
                        }))}
                        value={filters.categories}
                        onChange={(next) => {
                            setValue("categories", next);
                        }}
                    />
                </div>
            </FilterPanel>
        </div>
    );
};
