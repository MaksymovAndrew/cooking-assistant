import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import { RecipeListView } from "components/recipes/RecipeListView";

const UserRecipesPage: React.FC = () => {
    const { t } = useTranslation("recipes");

    const list = useRecipeListView(RECIPE_SOURCE.person);

    const heading =
        list.filters.types.length > 0
            ? t("userRecipesPage.recipesBy", { types: list.typesHeader })
            : t("userRecipesPage.myRecipes");

    return (
        <RecipeListView
            {...list}
            heading={heading}
            subtitle={t("userRecipesPage.subtitle", { count: list.total })}
            emptyTitle={t("userRecipesPage.emptyTitle")}
            emptyDescription={t("userRecipesPage.emptyDescription")}
            searchPlaceholder={t("userRecipesPage.searchPlaceholder")}
            onRetry={() => {
                list.refetch().catch(() => undefined);
            }}
            mine
        />
    );
};

export default UserRecipesPage;
