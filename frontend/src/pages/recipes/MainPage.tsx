import React from "react";
import { useTranslation } from "react-i18next";

import { RECIPE_SOURCE, useRecipeListView } from "hooks/useRecipeListView";

import { RecipeListView } from "components/recipes/RecipeListView";

const MainPage: React.FC = () => {
    const { t } = useTranslation("recipes");
    const list = useRecipeListView(RECIPE_SOURCE.all);

    const heading =
        list.filters.types.length > 0
            ? t("mainPage.recipesBy", { types: list.typesHeader })
            : t("mainPage.allRecipes");

    return (
        <RecipeListView
            {...list}
            heading={heading}
            subtitle={t("mainPage.subtitle")}
            emptyTitle={t("mainPage.emptyTitle")}
            emptyDescription={t("mainPage.emptyDescription")}
            searchPlaceholder={t("mainPage.searchPlaceholder")}
            onRetry={() => {
                list.refetch().catch(() => undefined);
            }}
        />
    );
};

export default MainPage;
