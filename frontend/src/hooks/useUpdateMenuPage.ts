import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useGetMenuCategoriesQuery } from "redux/services/menuCategoriesApi";
import {
    useGetMenuByIdQuery,
    useUpdateMenuMutation,
} from "redux/services/menusApi";

import { useAppRouter } from "hooks/useAppRouter";
import { useMenuForm } from "hooks/useMenuForm";

import { resolveEditPageState } from "utils/editPageState";
import { menuRecipeToListItem, recipeIdsOf } from "utils/menuFormRecipes";

export const useUpdateMenuPage = () => {
    const { t } = useTranslation("menu");
    const { id } = useParams<{ id: string }>();
    const router = useAppRouter();
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
    const menuQuery = useGetMenuByIdQuery(id);
    const menu = menuQuery.data;
    const [updateMenu] = useUpdateMenuMutation();

    useEffect(() => {
        if (!menu) {
            return;
        }

        setInitialValues({
            menuTitle: menu.menu.title || "",
            menuDescription: menu.menu.menuContent || "",
            language: menu.menu.language,
            selectedCategory: menu.menu.category_id,
            selectedRecipes: menu.recipes.map(menuRecipeToListItem),
            photoKey: menu.menu.photo_key,
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
                language: form.language,
                categoryId: form.selectedCategory,
                recipeIds: recipeIdsOf(form.selectedRecipes),
            },
        });

        if ("data" in result) {
            await form.photo.commit(Number(id));
            form.markClean();
            router.push(ROUTES.allMenus);
        }
    };

    return {
        form,
        categories,
        pageState: resolveEditPageState(menuQuery, menu?.menu.isOwner ?? null),
        retry: () => {
            void menuQuery.refetch();
        },
        handleSubmit,
    };
};
