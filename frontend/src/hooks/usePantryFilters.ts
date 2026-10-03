import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useIngredientCategories } from "hooks/useIngredientCategories";

import {
    isUrgent,
    pantryFilterDefs,
    type PantryFilterState,
} from "utils/filters/pantryFilterDefs";

import { useClientFilters } from "./useClientFilters";

interface UsePantryFiltersOptions {
    personIngredients: PantryIngredient[];
}

export const usePantryFilters = ({
    personIngredients,
}: UsePantryFiltersOptions) => {
    const { t } = useTranslation("ingredients");
    const categories = useIngredientCategories(personIngredients);
    const filterDefs = useMemo(() => pantryFilterDefs(t), [t]);
    const {
        values: filters,
        setValue,
        visibleItems: visibleIngredients,
    } = useClientFilters<PantryIngredient, PantryFilterState>(
        filterDefs,
        personIngredients,
    );

    // a category whose last item was just deleted is gone; reset during render, not in an effect
    if (
        filters.category &&
        !categories.some((category) => category.key === filters.category)
    ) {
        setValue("category", null);
    }

    const expiringSoonCount = useMemo(
        () =>
            personIngredients.filter((ingredient) =>
                isUrgent(ingredient.days_to_expire, ingredient.lots),
            ).length,
        [personIngredients],
    );

    const emptyMessage =
        personIngredients.length === 0
            ? t("page.noIngredients")
            : t("page.noSearchResults");

    return {
        query: filters.query,
        setQuery: (query: string) => {
            setValue("query", query);
        },
        expiringSoonOnly: filters.expiringSoonOnly,
        setExpiringSoonOnly: (expiringSoonOnly: boolean) => {
            setValue("expiringSoonOnly", expiringSoonOnly);
        },
        categoryFilter: filters.category,
        setCategoryFilter: (categoryFilter: string | null) => {
            setValue("category", categoryFilter);
        },
        categories,
        expiringSoonCount,
        visibleIngredients,
        emptyMessage,
    };
};
