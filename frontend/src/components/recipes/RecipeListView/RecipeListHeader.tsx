import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { LinkButton } from "components/ui/LinkButton";

import styles from "./RecipeListView.module.scss";

interface RecipeListHeaderProps {
    heading: string;
    subtitle: string;
}

const NEW_RECIPE_ICON_SIZE = 18;

export const RecipeListHeader: React.FC<RecipeListHeaderProps> = ({
    heading,
    subtitle,
}) => {
    const { t } = useTranslation();

    return (
        <div className={styles["recipe-list-view__header"]}>
            <div>
                <h1 className={styles["recipe-list-view__heading"]}>
                    {heading}
                </h1>
                <p className={styles["recipe-list-view__subtitle"]}>
                    {subtitle}
                </p>
            </div>
            <LinkButton to={ROUTES.addRecipe}>
                <Plus size={NEW_RECIPE_ICON_SIZE} aria-hidden="true" />
                {t("recipes:recipeListView.newRecipe")}
            </LinkButton>
        </div>
    );
};
