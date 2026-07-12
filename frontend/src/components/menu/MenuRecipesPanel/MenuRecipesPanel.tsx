import { Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { MenuDetailRecipe } from "types/menu";

import { UtensilsMarkSimple } from "components/icons";
import { MenuRecipeCard } from "components/menu/MenuRecipeCard";
import { EmptyState } from "components/ui/EmptyState";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./MenuRecipesPanel.module.scss";

interface MenuRecipesPanelProps {
    recipes: MenuDetailRecipe[];
    isOwner: boolean;
    addRecipesTo: string;
}

const SEARCH_ICON_SIZE = 16;

export const MenuRecipesPanel: React.FC<MenuRecipesPanelProps> = ({
    recipes,
    isOwner,
    addRecipesTo,
}) => {
    const { t } = useTranslation("menu");
    const [query, setQuery] = useState("");
    const trimmedQuery = query.trim().toLowerCase();

    const visibleRecipes = trimmedQuery
        ? recipes.filter((recipe) =>
              recipe.title.toLowerCase().includes(trimmedQuery),
          )
        : recipes;

    if (recipes.length === 0) {
        return (
            <EmptyState
                icon={UtensilsMarkSimple}
                title={t("menuDetailsPage.noRecipesYet")}
                description={t("menuDetailsPage.noRecipesYetDescription")}
                action={
                    isOwner && (
                        <LinkButton to={addRecipesTo} size="lg">
                            <Plus size={SEARCH_ICON_SIZE} aria-hidden="true" />
                            {t("menuDetailsPage.addRecipes")}
                        </LinkButton>
                    )
                }
            />
        );
    }

    return (
        <div className={styles["menu-recipes-panel"]}>
            <div className={styles["menu-recipes-panel__header"]}>
                <span className={styles["menu-recipes-panel__heading"]}>
                    {t("menuDetailsPage.recipes")}{" "}
                    <span className={styles["menu-recipes-panel__count"]}>
                        {recipes.length}
                    </span>
                </span>
                <div className={styles["menu-recipes-panel__search"]}>
                    <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                        placeholder={t("menuDetailsPage.searchPlaceholder")}
                        className={styles["menu-recipes-panel__search-input"]}
                    />
                </div>
            </div>
            {visibleRecipes.length === 0 ? (
                <p className={styles["menu-recipes-panel__no-results"]}>
                    {t("menuDetailsPage.noSearchResults")}
                </p>
            ) : (
                <div className={styles["menu-recipes-panel__grid"]}>
                    {visibleRecipes.map((recipe) => (
                        <MenuRecipeCard
                            key={recipe.recipe_id}
                            recipe={{
                                id: recipe.recipe_id,
                                title: recipe.title,
                                type_name: recipe.type_name,
                                cooking_time: recipe.cooking_time,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
