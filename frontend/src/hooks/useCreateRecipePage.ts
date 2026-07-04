import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import { useCreateRecipeMutation } from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { useRecipeForm } from "hooks/useRecipeForm";

import { parseCookingTime } from "utils/cookingTimeUtils";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

export const useCreateRecipePage = () => {
    const { t } = useTranslation("recipes");
    const form = useRecipeForm();
    const navigate = useNavigate();
    const { data: ingredients } = useGetIngredientsQuery(null);
    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);
    const [createRecipe] = useCreateRecipeMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(ingredients ?? [], "uk"),
        [ingredients],
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
                errorServings: t("createRecipePage.errorServings"),
            })
        ) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await createRecipe({
            title: form.title,
            content: form.content,
            ingredients: form.selectedIngredients.map((i) => ({
                id: i.id,
                quantity: i.quantity,
            })),
            type_id: form.selectedTypeId,
            cooking_time: parseCookingTime(form.cookingTime) ?? 0,
            servings: form.servings !== "" ? form.servings : undefined,
        });

        if ("data" in result) {
            void navigate(ROUTES.allRecipes);
        }
    };

    return { form, allIngredients, allTypes, handleSubmit };
};
