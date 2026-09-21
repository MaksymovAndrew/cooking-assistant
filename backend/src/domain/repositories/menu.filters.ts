import type { RecordAuthor, RecordRating } from "./recordAuthor";

export interface MenuFilters {
    menu_name?: string;
    category_ids?: string;
    favourites?: boolean;
    sort_order?: "rating";
    top_rated?: boolean;
    limit?: number;
    offset?: number;
}

export interface MenuSearchRow extends RecordRating {
    id: number;
    title: string;
    categoryName: string;
    menuContent: string;
    isOwner: boolean;
    isFavourite: boolean | null;
    recipe_count: number;
    photo_key: string | null;
    author: RecordAuthor;
}
