import { ArrowDownWideNarrow, Heart, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import type { SetFilterValue, SetFilterValues } from "hooks/useListFilters";

import { FilterChipGroup } from "components/ui/FilterChipGroup";
import { FilterPanel } from "components/ui/FilterPanel";
import { FilterToggle } from "components/ui/FilterToggle";
import { SearchField } from "components/ui/SearchField";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";

import styles from "./MenuFilterPanel.module.scss";

export interface MenuFilterPanelProps {
    filters: MenuFilterState;
    setValue: SetFilterValue<MenuFilterState>;
    setValues: SetFilterValues<MenuFilterState>;
    activeCount: number;
    categories: MenuCategory[];
    searchPlaceholder: string;
    total: number;
    // bumped by the caller on a full reset ("Clear all") - remounts SearchField so it can't
    // commit a debounce that was still pending when the reset happened
    searchResetKey?: number;
}

export const MenuFilterPanel: React.FC<MenuFilterPanelProps> = ({
    filters,
    setValue,
    setValues,
    activeCount,
    categories,
    searchPlaceholder,
    total,
    searchResetKey,
}) => {
    const { t } = useTranslation("menu");
    const { canFavourite } = useAppSelector(selectViewerCapabilities);
    const showResultsLabel = t("categoryFilter.showResults", { count: total });

    // resets only the fields the popover itself controls, leaving the search box (rendered
    // outside the popover) untouched - resetFilters is the full reset, used by "Clear all".
    // one setValues() call: separate setValue() calls would each read the same pre-reset URL
    const resetPanelFields = () => {
        setValues({
            categories: [],
            favourites: false,
            topRated: false,
            sort: null,
        });
    };

    return (
        <div className={styles["menu-filter-panel"]}>
            <SearchField
                key={searchResetKey}
                placeholder={`${t("common:search.placeholderPrefix")} ${searchPlaceholder}`}
                value={filters.search}
                onChange={(value) => {
                    setValue("search", value, { replace: true });
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
                onReset={resetPanelFields}
            >
                {canFavourite && (
                    <FilterToggle
                        icon={Heart}
                        label={t("categoryFilter.favouritesLabel")}
                        checked={filters.favourites}
                        onChange={(value) => {
                            setValue("favourites", value);
                        }}
                    />
                )}
                <FilterToggle
                    icon={Star}
                    label={t("categoryFilter.topRatedLabel")}
                    checked={filters.topRated}
                    onChange={(value) => {
                        setValue("topRated", value);
                    }}
                />
                <FilterToggle
                    icon={ArrowDownWideNarrow}
                    label={t("categoryFilter.sortByRatingLabel")}
                    checked={filters.sort === "rating"}
                    onChange={(value) => {
                        setValue("sort", value ? "rating" : null);
                    }}
                />
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
