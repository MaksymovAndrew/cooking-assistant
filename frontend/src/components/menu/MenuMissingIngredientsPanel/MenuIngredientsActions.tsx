import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";
import { useIsHydrated } from "hooks/useIsHydrated";

import { BasketAddMark } from "components/icons";
import { Link } from "components/ui/Link";

import {
    type AggregatedIngredient,
    missingShoppingItems,
} from "utils/menuUtils";

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
    const missingItems = missingShoppingItems(ingredients);

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
