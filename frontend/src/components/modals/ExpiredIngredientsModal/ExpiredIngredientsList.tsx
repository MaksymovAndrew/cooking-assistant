import { useTranslation } from "react-i18next";

import type { ExpiredPantryIngredient } from "types/expiry";

import { formatShortDate } from "utils/dateUtils";
import { resolveIngredientName } from "utils/ingredientName";

import styles from "./ExpiredIngredientsModal.module.scss";

interface ExpiredIngredientsListProps {
    ingredients: ExpiredPantryIngredient[];
}

// one group per ingredient, one row per expired purchase of it
export const ExpiredIngredientsList = ({
    ingredients,
}: ExpiredIngredientsListProps) => {
    const { t } = useTranslation("ingredients");

    return (
        <ul className={styles["expired-ingredients-modal__list"]}>
            {ingredients.map((ingredient) => (
                <li
                    key={ingredient.ingredientId}
                    className={styles["expired-ingredients-modal__group"]}
                >
                    <span className={styles["expired-ingredients-modal__name"]}>
                        {resolveIngredientName(ingredient)}
                    </span>
                    <ul className={styles["expired-ingredients-modal__lots"]}>
                        {ingredient.lots.map((lot) => (
                            <li
                                key={lot.purchaseDate}
                                className={
                                    styles["expired-ingredients-modal__lot"]
                                }
                            >
                                <span>
                                    {t("expiredNoticeModal.lotQuantity", {
                                        quantity: lot.quantity,
                                        unit: ingredient.unitName,
                                    })}
                                </span>
                                <span>
                                    {t("expiredNoticeModal.lotPurchased", {
                                        date: formatShortDate(lot.purchaseDate),
                                    })}
                                </span>
                                <span>
                                    {t("expiredNoticeModal.lotExpired", {
                                        date: formatShortDate(lot.expiryDate),
                                    })}
                                </span>
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
    );
};
