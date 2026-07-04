import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetRecipeByIdQuery,
    useUpdateRecipeMutation,
} from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { useRecipeForm } from "hooks/useRecipeForm";

import {
    formatCookingTimeInput,
    parseCookingTime,
} from "utils/cookingTimeUtils";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

export const useUpdateRecipePage = () => {
    const { t } = useTranslation("recipes");
    const { id } = useParams<{ id: string }>();
    const form = useRecipeForm();
    const { setInitialValues } = form;
    const navigate = useNavigate();
    const { data: ingredients } = useGetIngredientsQuery(null);
    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);
    const { data: recipe, isLoading } = useGetRecipeByIdQuery(id ?? skipToken);
    const [updateRecipe] = useUpdateRecipeMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(ingredients ?? [], "uk"),
        [ingredients],
    );

    useEffect(() => {
        if (!recipe) {
            return;
        }

        setInitialValues({
            title: recipe.title,
            content: recipe.content,
            cookingTime: formatCookingTimeInput(recipe.cooking_time),
            servings: recipe.servings ?? "",
            selectedTypeId: recipe.type_id,
            selectedIngredients: recipe.ingredients.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity_recipe_ingredients,
                unit_name: i.unit_name,
            })),
        });
    }, [recipe, setInitialValues]);

    const handleSubmit = async () => {
        if (!id) {
            return;
        }

        if (
            !form.validateChange({
                errorCookingTimeFormat: t(
                    "changeRecipePage.errorCookingTimeFormat",
                ),
                errorCookingTimeInvalid: t(
                    "changeRecipePage.errorCookingTimeInvalid",
                ),
                errorServings: t("changeRecipePage.errorServings"),
            })
        ) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await updateRecipe({
            id,
            data: {
                title: form.title,
                content: form.content,
                type_id: form.selectedTypeId,
                cooking_time: parseCookingTime(form.cookingTime) ?? 0,
                servings: form.servings !== "" ? form.servings : undefined,
                ingredients: form.selectedIngredients.map(
                    ({ id: recipeId, quantity }) => ({
                        id: recipeId,
                        quantity_recipe_ingredients: quantity,
                    }),
                ),
            },
        });

        if ("data" in result) {
            void navigate(ROUTES.allRecipes);
        }
    };

    return { form, allIngredients, allTypes, isLoading, handleSubmit };
};
