export interface MenuCategory {
    menu_category_id: number;
    category_name: string;
    category_description: string | null;
}

export interface MenuCategoryRepository {
    findAll(): Promise<MenuCategory[]>;
    exists(id: number): Promise<boolean>;
}
