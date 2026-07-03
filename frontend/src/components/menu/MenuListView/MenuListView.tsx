import React from "react";

import type { Menu, MenuCategory } from "types/menu";

import { ListPageLayout } from "components/layout/ListPageLayout";
import { MenuCard } from "components/menu/MenuCard";
import { MenuCategoryFilter } from "components/menu/MenuCategoryFilter";
import { ListLoadMoreFooter } from "components/ui/LoadMore";
import { SearchComponent } from "components/ui/SearchComponent";

interface MenuListViewProps {
    selectedCategories: number[];
    setSelectedCategories: (categories: number[]) => void;
    categories: MenuCategory[];
    menus: Menu[];
    noMenus: boolean;
    error: string | null;
    heading: string;
    emptyMessage: string;
    searchPlaceholder: string;
    actionSlot?: React.ReactNode;
    total: number;
    loadedCount: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    loadMoreError: string | null;
}

export const MenuListView: React.FC<MenuListViewProps> = ({
    selectedCategories,
    setSelectedCategories,
    categories,
    menus,
    noMenus,
    error,
    heading,
    emptyMessage,
    searchPlaceholder,
    actionSlot,
    total,
    loadedCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreError,
}) => {
    return (
        <ListPageLayout
            filterSlot={
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <SearchComponent placeholder={searchPlaceholder} />
                    <div className="ml-4 mt-4 sm:mt-0">
                        <MenuCategoryFilter
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onChange={setSelectedCategories}
                        />
                    </div>
                </div>
            }
            actionSlot={actionSlot}
            heading={heading}
            isEmpty={noMenus}
            emptyMessage={emptyMessage}
            error={error}
            footerSlot={
                <ListLoadMoreFooter
                    total={total}
                    loadedCount={loadedCount}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    loadMoreError={loadMoreError}
                />
            }
        >
            {menus.map((menu) => (
                <MenuCard
                    key={menu.id}
                    id={menu.id}
                    title={menu.title}
                    categoryName={menu.categoryname}
                    content={menu.menucontent}
                />
            ))}
        </ListPageLayout>
    );
};
