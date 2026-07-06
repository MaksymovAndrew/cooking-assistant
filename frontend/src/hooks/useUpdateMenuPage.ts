import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetMenuCategoriesQuery } from "redux/services/menuCategoriesApi";
import {
    useGetMenuByIdQuery,
    useUpdateMenuMutation,
} from "redux/services/menusApi";
import { useGetAllRecipesQuery } from "redux/services/recipesApi";

import { useMenuForm } from "hooks/useMenuForm";

export const useUpdateMenuPage = () => {
    const { t } = useTranslation("menu");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const form = useMenuForm({
        errorMessages: {
            emptyTitle: t("changeMenuPage.errorTitle"),
            emptyDescription: t("changeMenuPage.errorDescription"),
            noCategory: t("changeMenuPage.errorCategory"),
            noRecipes: t("changeMenuPage.errorRecipes"),
        },
    });
    const { setInitialValues } = form;
    const { data: categories = [] } = useGetMenuCategoriesQuery(null);
    const { data: allRecipes = [] } = useGetAllRecipesQuery(null);
    const { data: menu, isLoading } = useGetMenuByIdQuery(id ?? skipToken);
    const [updateMenu] = useUpdateMenuMutation();

    useEffect(() => {
        if (!menu) {
            return;
        }

        setInitialValues({
            menuTitle: menu.menu.title || "",
            menuDescription: menu.menu.menucontent || "",
            selectedCategory: menu.menu.category_id,
            selectedRecipes: menu.recipes.map((recipe) => recipe.recipe_id),
        });
    }, [menu, setInitialValues]);

    const handleSubmit = async () => {
        if (!form.validateForm() || !id) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await updateMenu({
            id,
            data: {
                menuTitle: form.menuTitle,
                menuContent: form.menuDescription,
                categoryId: form.selectedCategory,
                recipeIds: form.selectedRecipes,
            },
        });

        if ("data" in result) {
            void navigate(ROUTES.allMenus);
        }
    };

    return { form, categories, allRecipes, isLoading, handleSubmit };
};
