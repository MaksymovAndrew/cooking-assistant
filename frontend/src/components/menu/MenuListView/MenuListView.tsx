import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { MenuListParams } from "types/menu";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { AppShell } from "components/layout/AppShell";
import { MenuActiveFilters } from "components/menu/MenuActiveFilters";
import type { MenuFilterPanelProps } from "components/menu/MenuFilterPanel";
import { MenuFilterPanel } from "components/menu/MenuFilterPanel";
import { LinkButton } from "components/ui/LinkButton";

import type { MenuListResultsProps } from "./MenuListResults";
import { MenuListResults } from "./MenuListResults";
import styles from "./MenuListView.module.scss";

interface MenuListViewProps extends MenuFilterPanelProps, MenuListResultsProps {
    // the full reset, used by MenuActiveFilters ("Clear all") and the empty state -
    // MenuFilterPanel now owns a narrower reset scoped to just its own popover fields
    resetFilters: () => void;
    heading: string;
    subtitle: string;
    activeFilters: ActiveFilterEntry<MenuListParams>[];
}

const NEW_MENU_ICON_SIZE = 18;

export const MenuListView: React.FC<MenuListViewProps> = ({
    filters,
    setValue,
    setValues,
    resetFilters,
    activeCount,
    categories,
    heading,
    subtitle,
    hasActiveFilters,
    activeFilters,
    searchPlaceholder,
    total,
    ...results
}) => {
    const { t } = useTranslation();
    // bumped on every full reset so SearchField remounts and drops any pending, uncommitted
    // debounce - see the matching comment in RecipeListView for the full failure scenario
    const [searchResetKey, setSearchResetKey] = useState(0);

    const handleResetFilters = () => {
        resetFilters();
        setSearchResetKey((key) => key + 1);
    };

    return (
        <AppShell>
            <div className={styles["menu-list-view"]}>
                <div className={styles["menu-list-view__header"]}>
                    <div>
                        <h1 className={styles["menu-list-view__heading"]}>
                            {heading}
                        </h1>
                        <p className={styles["menu-list-view__subtitle"]}>
                            {subtitle}
                        </p>
                    </div>
                    <LinkButton href={ROUTES.addMenu}>
                        <Plus size={NEW_MENU_ICON_SIZE} aria-hidden="true" />
                        {t("menu:menuListView.newMenu")}
                    </LinkButton>
                </div>
                <MenuFilterPanel
                    filters={filters}
                    setValue={setValue}
                    setValues={setValues}
                    activeCount={activeCount}
                    categories={categories}
                    searchPlaceholder={searchPlaceholder}
                    total={total}
                    searchResetKey={searchResetKey}
                />
                <MenuActiveFilters
                    total={total}
                    activeFilters={activeFilters}
                    hasActiveFilters={hasActiveFilters}
                    resetFilters={handleResetFilters}
                />
                <MenuListResults
                    {...results}
                    hasActiveFilters={hasActiveFilters}
                    total={total}
                    searchQuery={filters.search || null}
                    clearFilters={handleResetFilters}
                />
            </div>
        </AppShell>
    );
};
