import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AllergenSlug } from "constants/allergens";
import type { Ingredient } from "types/ingredient";

import {
    useAvoidAllergenMutation,
    useAvoidIngredientMutation,
    useGetDietPreferencesQuery,
    useUnavoidAllergenMutation,
    useUnavoidIngredientMutation,
} from "redux/services/dietPreferencesApi";
import { useGetIngredientsQuery } from "redux/services/ingredientsApi";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useLocale } from "hooks/useLocale";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

const SAVED_INDICATOR_MS = 3000;

// a failed write is rolled back by the api layer and toasted by the global listener
const ignoreRejection = () => undefined;

// the profile's avoid list: every tap saves on its own, the chip flips at once (see dietPreferencesApi),
// and a short "saved" note confirms the last write that landed
export const useDietPreferences = () => {
    const isHydrated = useIsHydrated();
    const { t } = useTranslation();
    const locale = useLocale();
    const { data } = useGetDietPreferencesQuery(null);
    const { data: catalog = [] } = useGetIngredientsQuery(null);
    const [avoidAllergen] = useAvoidAllergenMutation();
    const [unavoidAllergen] = useUnavoidAllergenMutation();
    const [avoidIngredient] = useAvoidIngredientMutation();
    const [unavoidIngredient] = useUnavoidIngredientMutation();
    const [isSavedVisible, setIsSavedVisible] = useState(false);
    const savedTimerRef = useRef<number | null>(null);

    useEffect(
        () => () => {
            if (savedTimerRef.current !== null) {
                window.clearTimeout(savedTimerRef.current);
            }
        },
        [],
    );

    const allergens = useMemo(() => data?.allergens ?? [], [data]);
    const ingredientIds = useMemo(() => data?.ingredient_ids ?? [], [data]);
    const avoidedIngredients = useMemo(
        () =>
            sortIngredientsByName(
                catalog.filter((ingredient) =>
                    ingredientIds.includes(ingredient.id),
                ),
                t,
                locale,
            ),
        [catalog, ingredientIds, t, locale],
    );

    const showSaved = () => {
        if (savedTimerRef.current !== null) {
            window.clearTimeout(savedTimerRef.current);
        }

        setIsSavedVisible(true);
        savedTimerRef.current = window.setTimeout(() => {
            setIsSavedVisible(false);
        }, SAVED_INDICATOR_MS);
    };

    const save = (request: { unwrap: () => Promise<null> }) => {
        request.unwrap().then(showSaved).catch(ignoreRejection);
    };

    const toggleAllergen = (slug: AllergenSlug) => {
        save(
            allergens.includes(slug)
                ? unavoidAllergen(slug)
                : avoidAllergen(slug),
        );
    };

    const toggleIngredient = (ingredient: Ingredient) => {
        save(
            ingredientIds.includes(ingredient.id)
                ? unavoidIngredient(ingredient.id)
                : avoidIngredient(ingredient.id),
        );
    };

    return {
        isReady: isHydrated && typeof data !== "undefined",
        allergens,
        ingredientIds,
        catalog,
        avoidedIngredients,
        isSavedVisible,
        toggleAllergen,
        toggleIngredient,
    };
};
