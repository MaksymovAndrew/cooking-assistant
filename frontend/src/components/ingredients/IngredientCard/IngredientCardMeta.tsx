import React from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { formatShortDate } from "utils/dateUtils";

import styles from "./IngredientCard.module.scss";

interface IngredientCardMetaProps {
    ingredient: PantryIngredient;
}

export const IngredientCardMeta: React.FC<IngredientCardMetaProps> = ({
    ingredient,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <dl className={styles["ingredient-card__meta"]}>
            <div className={styles["ingredient-card__meta-row"]}>
                <dt>{t("page.allergens")}</dt>
                <dd>
                    {ingredient.allergens.length > 0
                        ? ingredient.allergens.join(", ")
                        : "—"}
                </dd>
            </div>
            <div className={styles["ingredient-card__meta-row"]}>
                <dt>{t("page.shelfLife")}</dt>
                <dd>
                    {typeof ingredient.days_to_expire === "number"
                        ? t("page.shelfLifeDays", {
                              days: ingredient.days_to_expire,
                          })
                        : t("page.noExpiration")}
                </dd>
            </div>
            <div className={styles["ingredient-card__meta-row"]}>
                <dt>{t("page.purchaseDate")}</dt>
                <dd>
                    {ingredient.purchase_date
                        ? formatShortDate(ingredient.purchase_date)
                        : t("page.purchaseDateUnknown")}
                </dd>
            </div>
        </dl>
    );
};
