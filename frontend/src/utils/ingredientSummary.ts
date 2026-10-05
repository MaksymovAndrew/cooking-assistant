import type { TFunction } from "i18next";

import { resolveCategory } from "utils/ingredientName";

interface SummarizableIngredient {
    category: string;
    days_to_expire: number | null;
}

// t is bound to the "ingredients" namespace: "Vegetables · Shelf life: 30 days"
export const ingredientSummary = (
    t: TFunction,
    { category, days_to_expire }: SummarizableIngredient,
): string => {
    const categoryName = resolveCategory(t, category);

    return days_to_expire === null
        ? categoryName
        : `${categoryName} · ${t("page.shelfLife")} ${t("page.shelfLifeDays", { count: days_to_expire })}`;
};
