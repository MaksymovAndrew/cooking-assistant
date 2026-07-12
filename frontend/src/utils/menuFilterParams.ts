import type { MenuListParams } from "types/menu";

export const buildMenuFilterParams = (
    selectedCategories: number[],
    menuName: string | null,
): MenuListParams => ({
    menu_name: menuName ?? "",
    category_ids:
        selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
});
