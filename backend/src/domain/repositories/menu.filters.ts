export interface MenuFilters {
    menu_name?: string;
    category_ids?: string;
    limit?: number;
    offset?: number;
}

export interface MenuSearchRow {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    person_id: number;
    recipe_count: number;
}
