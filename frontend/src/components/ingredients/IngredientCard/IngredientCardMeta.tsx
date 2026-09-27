import React from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useLocale } from "hooks/useLocale";

import { formatShortDate } from "utils/dateUtils";
import { resolveAllergen } from "utils/ingredientName";

import styles from "./IngredientCard.module.scss";

interface IngredientCardMetaProps {
    ingredient: PantryIngredient;
}

export const IngredientCardMeta: React.FC<IngredientCardMetaProps> = ({
    ingredient,
}) => {
    const { t } = useTranslation("ingredients");
    const locale = useLocale();

    return (
        <dl className={styles["ingredient-card__meta"]}>
            <div className={styles["ingredient-card__meta-row"]}>
                <dt>{t("page.allergens")}</dt>
                <dd>
                    {ingredient.allergens.length > 0
                        ? ingredient.allergens
                              .map((slug) => resolveAllergen(t, slug))
                              .join(", ")
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
                        ? formatShortDate(ingredient.purchase_date, locale)
                        : t("page.purchaseDateUnknown")}
                </dd>
            </div>
        </dl>
    );
};
