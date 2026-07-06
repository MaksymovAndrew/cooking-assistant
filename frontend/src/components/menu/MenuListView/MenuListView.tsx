import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { Menu, MenuCategory } from "types/menu";

import { NotebookMark } from "components/icons";
import { AppShell } from "components/layout/AppShell";
import { MenuActiveFilters } from "components/menu/MenuActiveFilters";
import { MenuCard } from "components/menu/MenuCard";
import { MenuFilterPanel } from "components/menu/MenuFilterPanel";
import { EmptyState } from "components/ui/EmptyState";
import { ErrorState } from "components/ui/ErrorState";
import { LinkButton } from "components/ui/LinkButton";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import styles from "./MenuListView.module.scss";

interface MenuListViewProps {
    selectedCategories: number[];
    setSelectedCategories: (categories: number[]) => void;
    categories: MenuCategory[];
    menus: Menu[];
    noMenus: boolean;
    error: string | null;
    onRetry: () => void;
    heading: string;
    emptyMessage: string;
    searchPlaceholder: string;
    mine?: boolean;
    total: number;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

const NEW_MENU_ICON_SIZE = 18;

export const MenuListView: React.FC<MenuListViewProps> = ({
    selectedCategories,
    setSelectedCategories,
    categories,
    menus,
    noMenus,
    error,
    onRetry,
    heading,
    emptyMessage,
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

    return (
        <AppShell>
            <div className={styles["menu-list-view"]}>
                <div className={styles["menu-list-view__header"]}>
                    <h1 className={styles["menu-list-view__heading"]}>
                        {heading}
                    </h1>
                    <LinkButton to={ROUTES.addMenu}>
                        <Plus size={NEW_MENU_ICON_SIZE} aria-hidden="true" />
                        {t("menu:menuListView.newMenu")}
                    </LinkButton>
                </div>
                <MenuFilterPanel
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    searchPlaceholder={searchPlaceholder}
                />
                <MenuActiveFilters
                    total={total}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
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
                    <EmptyState
                        icon={NotebookMark}
                        title={emptyMessage}
                        action={
                            <LinkButton to={ROUTES.addMenu} size="lg">
                                <Plus
                                    size={NEW_MENU_ICON_SIZE}
                                    aria-hidden="true"
                                />
                                {t("menu:menuListView.newMenu")}
                            </LinkButton>
                        }
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
                                mine={mine}
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
