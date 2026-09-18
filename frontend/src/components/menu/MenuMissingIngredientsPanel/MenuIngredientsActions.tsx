import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";
import { useIsHydrated } from "hooks/useIsHydrated";

import { BasketAddMark } from "components/icons";
import { Link } from "components/ui/Link";

import type { AggregatedIngredient } from "utils/menuUtils";
import { roundQuantity } from "utils/roundQuantity";

import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuIngredientsActionsProps {
    ingredients: Record<number, AggregatedIngredient>;
}

const BUTTON_ICON_SIZE = 15;

export const MenuIngredientsActions: React.FC<MenuIngredientsActionsProps> = ({
    ingredients,
}) => {
    const { t } = useTranslation("menu");
    const { t: tShoppingList } = useTranslation("shoppingList");
    const isHydrated = useIsHydrated();
    const { add, isAdding } = useAddToShoppingList();
    // only the shortfall goes on the list, not the whole amount the menu needs
    const missingItems = Object.entries(ingredients)
        .filter(([, ingredient]) => !ingredient.sufficient)
        .map(([id, ingredient]) => ({
            ingredient_id: Number(id),
            quantity: roundQuantity(ingredient.missingQuantity),
        }));

    return (
        <div className={styles["menu-missing-ingredients-panel__actions"]}>
            {missingItems.length > 0 && (
                <button
                    type="button"
                    disabled={!isHydrated || isAdding}
                    className={styles["menu-missing-ingredients-panel__add"]}
                    onClick={() => {
                        add(missingItems);
                    }}
                >
                    <BasketAddMark size={BUTTON_ICON_SIZE} />
                    {tShoppingList("addFromElsewhere.addMissing")}
                </button>
            )}
            <Link
                href={ROUTES.ingredients}
                className={styles["menu-missing-ingredients-panel__pantry"]}
            >
                {t("menuDetailsPage.goToPantry")}
            </Link>
        </div>
    );
};
