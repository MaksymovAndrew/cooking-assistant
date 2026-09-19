import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";
import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { Button } from "components/ui/Button";
import { Link } from "components/ui/Link";

import { roundQuantity } from "utils/roundQuantity";

import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsBannerProps {
    isOwner: boolean;
    haveCount: number;
    missingCount: number;
    availability: IngredientAvailability[];
    portionCount: number;
}

export const RecipeIngredientsBanner: React.FC<
    RecipeIngredientsBannerProps
> = ({ isOwner, haveCount, missingCount, availability, portionCount }) => {
    const { t } = useTranslation("recipes");
    const { t: tShoppingList } = useTranslation("shoppingList");
    const { add, isAdding } = useAddToShoppingList();
    // the pantry check is presence only, so what's missing is the recipe's full amount for these portions
    const missingItems = availability
        .filter((ingredient) => !ingredient.have)
        .map((ingredient) => ({
            ingredient_id: ingredient.id,
            quantity: roundQuantity(
                ingredient.quantity_recipe_ingredients * portionCount,
            ),
        }));

    return (
        <div className={styles["recipe-ingredients-panel__banner"]}>
            <span
                className={styles["recipe-ingredients-panel__banner-dot"]}
                aria-hidden="true"
            />
            <div>
                <div
                    className={styles["recipe-ingredients-panel__banner-title"]}
                >
                    {t("recipeDetailsPage.missingIngredients")}
                </div>
                <div
                    className={styles["recipe-ingredients-panel__banner-text"]}
                >
                    {isOwner
                        ? t("recipeDetailsPage.haveOfTotalToBuy", {
                              have: haveCount,
                              total: availability.length,
                              count: missingCount,
                          })
                        : t("recipeDetailsPage.haveOfTotalVisitor", {
                              have: haveCount,
                              total: availability.length,
                          })}{" "}
                    <Link
                        href={ROUTES.ingredients}
                        className={
                            styles["recipe-ingredients-panel__banner-link"]
                        }
                    >
                        {t("recipeDetailsPage.checkPantry")}
                    </Link>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    loading={isAdding}
                    className={styles["recipe-ingredients-panel__banner-add"]}
                    onClick={() => {
                        add(missingItems);
                    }}
                >
                    {tShoppingList("addFromElsewhere.addMissing")}
                </Button>
            </div>
        </div>
    );
};
