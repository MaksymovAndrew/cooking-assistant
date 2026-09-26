import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import { MINUTES_PER_HOUR } from "constants/time";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import { useCreateRecipeMutation } from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { useAppRouter } from "hooks/useAppRouter";
import { useLocale } from "hooks/useLocale";
import { useRecipeForm } from "hooks/useRecipeForm";

import { sortIngredientsByName } from "utils/sortIngredientsByName";

export const useCreateRecipePage = () => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    const form = useRecipeForm();
    const router = useAppRouter();
    const { data: ingredients } = useGetIngredientsQuery(null);
    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);
    const [createRecipe] = useCreateRecipeMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(ingredients ?? [], t, locale),
        [ingredients, t, locale],
    );

    const handleSubmit = async () => {
        if (
            !form.validateCreate({
                errorTitle: t("createRecipePage.errorTitle"),
                errorDescription: t("createRecipePage.errorDescription"),
                errorIngredients: t("createRecipePage.errorIngredients"),
                errorType: t("createRecipePage.errorType"),
                errorCookingTimeFormat: t(
                    "createRecipePage.errorCookingTimeFormat",
                ),
                errorCookingTimeInvalid: t(
                    "createRecipePage.errorCookingTimeInvalid",
                ),
            })
        ) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await createRecipe({
            title: form.title,
            content: form.content,
            language: form.language,
            ingredients: form.selectedIngredients.map((i) => ({
                id: i.id,
                quantity: i.quantity,
            })),
            type_id: form.selectedTypeId,
            cooking_time:
                Number(form.cookingHours) * MINUTES_PER_HOUR +
                Number(form.cookingMinutes),
            calories_override:
                form.caloriesOverride === ""
                    ? null
                    : Number(form.caloriesOverride),
        });

        if (result.data) {
            await form.photo.commit(result.data.id);
            form.markClean();
            router.push(ROUTES.allRecipes);
        }
    };

    return { form, allIngredients, allTypes, handleSubmit };
};
