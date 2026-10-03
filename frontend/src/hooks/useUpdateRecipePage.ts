import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useGetIngredientsQuery } from "redux/services/ingredientsApi";
import {
    useGetRecipeByIdQuery,
    useUpdateRecipeMutation,
} from "redux/services/recipesApi";
import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { useAppRouter } from "hooks/useAppRouter";
import { useLocale } from "hooks/useLocale";
import { useRecipeForm } from "hooks/useRecipeForm";

import { resolveEditPageState } from "utils/editPageState";
import {
    formValuesToUpdateRequest,
    recipeToFormValues,
} from "utils/recipeFormValues";
import { sortIngredientsByName } from "utils/sortIngredientsByName";

export const useUpdateRecipePage = () => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    const { id } = useParams<{ id: string }>();
    const form = useRecipeForm();
    const { setInitialValues } = form;
    const router = useAppRouter();
    const { data: ingredients } = useGetIngredientsQuery(null);
    const { data: allTypes = [] } = useGetRecipeTypesQuery(null);
    const recipeQuery = useGetRecipeByIdQuery(id);
    const recipe = recipeQuery.data;
    const [updateRecipe] = useUpdateRecipeMutation();

    const allIngredients = useMemo(
        () => sortIngredientsByName(ingredients ?? [], t, locale),
        [ingredients, t, locale],
    );

    useEffect(() => {
        if (recipe) {
            setInitialValues(recipeToFormValues(recipe));
        }
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
            })
        ) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await updateRecipe({
            id,
            data: formValuesToUpdateRequest(form),
        });

        if ("data" in result) {
            await form.photo.commit(Number(id));
            form.markClean();
            router.push(ROUTES.allRecipes);
        }
    };

    return {
        form,
        allIngredients,
        allTypes,
        pageState: resolveEditPageState(recipeQuery, recipe?.isOwner ?? null),
        retry: () => {
            void recipeQuery.refetch();
        },
        handleSubmit,
    };
};
