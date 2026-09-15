import React from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";
import type { Menu } from "types/menu";

import { useMediaQuery } from "hooks/useMediaQuery";

import { NotebookMark } from "components/icons";
import { MenuCard } from "components/menu/MenuCard";
import { EmptyState } from "components/ui/EmptyState";
import { ListLoadMoreFooter } from "components/ui/LoadMore";

import styles from "./ProfileMenusTab.module.scss";

interface ProfileMenusTabProps {
    menus: Menu[];
    total: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    // the favourites list reuses this tab with its own empty-state wording
    emptyTitle?: string;
}

export const ProfileMenusTab: React.FC<ProfileMenusTabProps> = ({
    menus,
    total,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    emptyTitle,
}) => {
    const { t } = useTranslation("profile");
    const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

    if (menus.length === 0) {
        return (
            <EmptyState
                icon={NotebookMark}
                title={emptyTitle ?? t("profilePage.noMenus")}
            />
        );
    }

    return (
        <>
            <div className={styles["profile-menus-tab__grid"]}>
                {menus.map((menu) => (
                    <MenuCard
                        key={menu.id}
                        id={menu.id}
                        title={menu.title}
                        categoryName={menu.categoryname}
                        recipeCount={menu.recipe_count}
                        isFavourite={menu.isFavourite}
                        mine={Boolean(menu.isOwner)}
                        variant={isMobile ? "row" : "grid"}
                    />
                ))}
            </div>
            <ListLoadMoreFooter
                total={total}
                loadedCount={menus.length}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                loadMoreError={null}
            />
        </>
    );
};
