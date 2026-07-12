import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { useGetMenuCategoriesQuery } from "redux/services/menuCategoriesApi";
import { useCreateMenuMutation } from "redux/services/menusApi";
import { useGetAllRecipesQuery } from "redux/services/recipesApi";

import { useMenuForm } from "hooks/useMenuForm";

export const useCreateMenuPage = () => {
    const { t } = useTranslation("menu");
    const navigate = useNavigate();
    const form = useMenuForm({
        errorMessages: {
            emptyTitle: t("createMenuPage.errorTitle"),
            emptyDescription: t("createMenuPage.errorDescription"),
            noCategory: t("createMenuPage.errorCategory"),
            noRecipes: t("createMenuPage.errorRecipes"),
        },
    });
    const { data: categories = [] } = useGetMenuCategoriesQuery(null);
    const { data: allRecipes = [] } = useGetAllRecipesQuery(null);
    const [createMenu] = useCreateMenuMutation();

    const handleSubmit = async () => {
        if (!form.validateForm() || form.selectedCategory === null) {
            return;
        }

        // a failed mutation is already toasted by the global listener
        const result = await createMenu({
            menuTitle: form.menuTitle,
            menuContent: form.menuDescription,
            categoryId: form.selectedCategory,
            recipeIds: form.selectedRecipes,
        });

        if ("data" in result) {
            form.markClean();
            void navigate(ROUTES.allMenus);
        }
    };

    return { form, categories, allRecipes, handleSubmit };
};
