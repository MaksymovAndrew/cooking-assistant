export interface MenuFilters {
    menu_name?: string;
    category_ids?: string;
    favourites?: boolean;
    limit?: number;
    offset?: number;
}

export interface MenuSearchRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    isOwner: boolean;
    isFavourite: boolean | null;
    recipe_count: number;
}
