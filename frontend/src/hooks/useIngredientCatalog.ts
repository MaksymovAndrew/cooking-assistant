import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";

import { useLocale } from "hooks/useLocale";

import { hasFailedWithoutData } from "utils/queryStatus";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

export const useIngredientCatalog = () => {
    const { t } = useTranslation();
    const locale = useLocale();
    const { data: rawAllIngredients } = useGetIngredientsQuery(null);
    const pantryQuery = useGetUserIngredientsQuery(null);
    const rawUserIngredients = pantryQuery.data;

    const allIngredients = useMemo(
        () => sortIngredientsByName(rawAllIngredients ?? [], t, locale),
        [rawAllIngredients, t, locale],
    );
    const personIngredients = useMemo<PantryIngredient[]>(
        () =>
            (rawUserIngredients ?? []).map((item) => ({
                ...item,
                id: item.ingredient_id,
                slug: item.ingredient_slug,
            })),
        [rawUserIngredients],
    );

    return {
        allIngredients,
        personIngredients,
        isLoading: pantryQuery.isLoading,
        isError: hasFailedWithoutData(pantryQuery),
        retry: () => {
            void pantryQuery.refetch();
        },
    };
};
