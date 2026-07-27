import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useIngredientCategories } from "hooks/useIngredientCategories";

import { getExpiryStatus } from "utils/expiry";
import { resolvePantryIngredientName } from "utils/ingredientName";

const isUrgent = (
    daysToExpire: number | null | undefined,
    purchaseDate: string | undefined,
): boolean => {
    const status = getExpiryStatus(daysToExpire, purchaseDate);

    return status !== null && status.tone !== "ok";
};

interface UsePantryFiltersOptions {
    personIngredients: PantryIngredient[];
    // while editing quantities, the page filters over the in-flight draft rather than the stale cache
    sourceIngredients: PantryIngredient[];
}

// search/category/expiring-soon filtering for the pantry page, kept out of the component to stay under the file's line cap
export const usePantryFilters = ({
    personIngredients,
    sourceIngredients,
}: UsePantryFiltersOptions) => {
    const { t } = useTranslation("ingredients");
    const [query, setQuery] = useState("");
    const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const categories = useIngredientCategories(personIngredients);

    // the selected category can vanish from the pantry (its last item just got deleted) -
    // drop the stale filter rather than silently matching nothing forever
    useEffect(() => {
        if (
            categoryFilter &&
            !categories.some((category) => category.key === categoryFilter)
        ) {
            setCategoryFilter(null);
        }
    }, [categoryFilter, categories]);

    const expiringSoonCount = useMemo(
        () =>
            personIngredients.filter((ingredient) =>
                isUrgent(ingredient.days_to_expire, ingredient.purchase_date),
            ).length,
        [personIngredients],
    );

    const visibleIngredients = sourceIngredients.filter((ingredient) => {
        const matchesQuery = resolvePantryIngredientName(ingredient)
            .toLowerCase()
            .includes(query.trim().toLowerCase());

        if (!matchesQuery) {
            return false;
        }

        if (categoryFilter && ingredient.category !== categoryFilter) {
            return false;
        }

        return (
            !expiringSoonOnly ||
            isUrgent(ingredient.days_to_expire, ingredient.purchase_date)
        );
    });

    const emptyMessage =
        personIngredients.length === 0
            ? t("page.noIngredients")
            : t("page.noSearchResults");

    return {
        query,
        setQuery,
        expiringSoonOnly,
        setExpiringSoonOnly,
        categoryFilter,
        setCategoryFilter,
        categories,
        expiringSoonCount,
        visibleIngredients,
        emptyMessage,
    };
};
