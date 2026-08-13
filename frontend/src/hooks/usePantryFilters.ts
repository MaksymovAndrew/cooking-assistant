import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useIngredientCategories } from "hooks/useIngredientCategories";

import {
    isUrgent,
    PANTRY_FILTER_DEFS,
    type PantryFilterState,
} from "utils/filters/pantryFilterDefs";

import { useClientFilters } from "./useClientFilters";

interface UsePantryFiltersOptions {
    personIngredients: PantryIngredient[];
}

// search/category/expiring-soon filtering for the pantry page, kept out of the component to stay under the file's line cap
export const usePantryFilters = ({
    personIngredients,
}: UsePantryFiltersOptions) => {
    const { t } = useTranslation("ingredients");
    const categories = useIngredientCategories(personIngredients);
    const {
        values: filters,
        setValue,
        visibleItems: visibleIngredients,
    } = useClientFilters<PantryIngredient, PantryFilterState>(
        PANTRY_FILTER_DEFS,
        personIngredients,
    );

    // drops a stale category filter (its last item just got deleted) rather than silently matching nothing forever - adjusted during render, not via an effect, since it's already a conditional, idempotent correction
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
