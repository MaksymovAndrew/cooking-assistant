import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import { RecipeListView } from "components/recipes/RecipeListView";

const UserRecipesPage: React.FC = () => {
    const { t } = useTranslation("recipes");

    const list = useRecipeListView(RECIPE_SOURCE.person);

    const heading =
        list.filters.selectedTypes.length > 0
            ? t("userRecipesPage.recipesBy", { types: list.typesHeader })
            : t("userRecipesPage.myRecipes");

    const emptyMessage =
        list.filters.selectedTypes.length > 0
            ? t("userRecipesPage.noRecipesType")
            : t("userRecipesPage.createFirst");

    return (
        <RecipeListView
            {...list}
            heading={heading}
            emptyMessage={emptyMessage}
            searchPlaceholder={t("userRecipesPage.searchPlaceholder")}
            onRetry={() => {
                list.refetch().catch(() => undefined);
            }}
            mine
        />
    );
};

export default UserRecipesPage;
