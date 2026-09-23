import React from "react";
import { useTranslation } from "react-i18next";

import type { Menu } from "types/menu";

import { MenuCard } from "components/menu/MenuCard";
import { ErrorState } from "components/ui/ErrorState";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import { MenuListEmptyState } from "./MenuListEmptyState";
import styles from "./MenuListView.module.scss";

export interface MenuListResultsProps {
    menus: Menu[];
    noMenus: boolean;
    error: string | null;
    onRetry: () => void;
    emptyTitle: string;
    emptyDescription: string;
    hasActiveFilters: boolean;
    mine?: boolean;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

interface Props extends MenuListResultsProps {
    total: number;
    searchQuery: string | null;
    clearFilters: () => void;
}

export const MenuListResults: React.FC<Props> = ({
    menus,
    noMenus,
    error,
    onRetry,
    emptyTitle,
    emptyDescription,
    hasActiveFilters,
    mine = false,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
    searchQuery,
    clearFilters,
}) => {
    const { t } = useTranslation();

    if (error) {
        return (
            <ErrorState
                title={t("errorState.title")}
                description={error}
                onRetry={onRetry}
                retryLabel={t("errorState.retry")}
            />
        );
    }

    if (noMenus) {
        return (
            <MenuListEmptyState
                hasActiveFilters={hasActiveFilters}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                searchQuery={searchQuery}
                clearFilters={clearFilters}
            />
        );
    }

    return (
        <>
            <div className={styles["menu-list-view__grid"]}>
                {menus.map((menu) => (
                    <MenuCard
                        key={menu.id}
                        menu={menu}
                        mine={mine || Boolean(menu.isOwner)}
                    />
                ))}
            </div>
            <ListLoadMoreFooter
                total={total}
                loadedCount={loadedCount}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                loadMoreError={loadMoreError}
            />
        </>
    );
};
