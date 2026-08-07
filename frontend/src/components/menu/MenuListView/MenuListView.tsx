import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { Menu, MenuListParams } from "types/menu";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { AppShell } from "components/layout/AppShell";
import { MenuActiveFilters } from "components/menu/MenuActiveFilters";
import { MenuCard } from "components/menu/MenuCard";
import type { MenuFilterPanelProps } from "components/menu/MenuFilterPanel";
import { MenuFilterPanel } from "components/menu/MenuFilterPanel";
import { ErrorState } from "components/ui/ErrorState";
import { LinkButton } from "components/ui/LinkButton";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import { MenuListEmptyState } from "./MenuListEmptyState";
import styles from "./MenuListView.module.scss";

interface MenuListViewProps extends MenuFilterPanelProps {
    menus: Menu[];
    noMenus: boolean;
    // the full reset, used by MenuActiveFilters ("Clear all") and the empty state -
    // MenuFilterPanel now owns a narrower reset scoped to just its own popover fields
    resetFilters: () => void;
    error: string | null;
    onRetry: () => void;
    heading: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    hasActiveFilters: boolean;
    activeFilters: ActiveFilterEntry<MenuListParams>[];
    mine?: boolean;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

const NEW_MENU_ICON_SIZE = 18;

export const MenuListView: React.FC<MenuListViewProps> = ({
    filters,
    setValue,
    resetFilters,
    activeCount,
    categories,
    menus,
    noMenus,
    error,
    onRetry,
    heading,
    subtitle,
    emptyTitle,
    emptyDescription,
    hasActiveFilters,
    activeFilters,
    searchPlaceholder,
    mine = false,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
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
                    <LinkButton to={ROUTES.addMenu}>
                        <Plus size={NEW_MENU_ICON_SIZE} aria-hidden="true" />
                        {t("menu:menuListView.newMenu")}
                    </LinkButton>
                </div>
                <MenuFilterPanel
                    filters={filters}
                    setValue={setValue}
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
                {error && (
                    <ErrorState
                        title={t("errorState.title")}
                        description={error}
                        onRetry={onRetry}
                        retryLabel={t("errorState.retry")}
                    />
                )}
                {!error && noMenus && (
                    <MenuListEmptyState
                        hasActiveFilters={hasActiveFilters}
                        emptyTitle={emptyTitle}
                        emptyDescription={emptyDescription}
                        searchQuery={filters.search || null}
                        clearFilters={handleResetFilters}
                    />
                )}
                {!error && !noMenus && (
                    <div className={styles["menu-list-view__grid"]}>
                        {menus.map((menu) => (
                            <MenuCard
                                key={menu.id}
                                id={menu.id}
                                title={menu.title}
                                categoryName={menu.categoryname}
                                recipeCount={menu.recipe_count}
                                mine={mine || Boolean(menu.isOwner)}
                            />
                        ))}
                    </div>
                )}
                {!error && !noMenus && (
                    <ListLoadMoreFooter
                        total={total}
                        loadedCount={loadedCount}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        loadMoreError={loadMoreError}
                    />
                )}
            </div>
        </AppShell>
    );
};
