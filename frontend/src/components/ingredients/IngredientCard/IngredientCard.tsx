import React from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useLocale } from "hooks/useLocale";

import { BasketAddMark, TrashMark } from "components/icons";
import { Chip } from "components/ui/Chip";

import { getWorstLotExpiryStatus } from "utils/expiry";
import { resolvePantryIngredientName } from "utils/ingredientName";
import { unitName } from "utils/referenceLabels";
import { formatQuantity } from "utils/roundQuantity";

import { getExpiryPresentation } from "./getExpiryPresentation";
import styles from "./IngredientCard.module.scss";
import { IngredientCardMeta } from "./IngredientCardMeta";

interface IngredientCardProps {
    ingredient: PantryIngredient;
    onOpenHistory: (ingredient: PantryIngredient) => void;
    onRestock: (ingredient: PantryIngredient) => void;
    onDelete: (ingredient: PantryIngredient) => void;
}

const DELETE_ICON_SIZE = 15;
const RESTOCK_ICON_SIZE = 16;

export const IngredientCard: React.FC<IngredientCardProps> = ({
    ingredient,
    onOpenHistory,
    onRestock,
    onDelete,
}) => {
    const { t } = useTranslation("ingredients");
    const locale = useLocale();
    const status = getWorstLotExpiryStatus(
        ingredient.days_to_expire,
        ingredient.lots,
    );
    const expiry = getExpiryPresentation(status, t);
    const displayName = resolvePantryIngredientName(t, ingredient);

    return (
        <div
            className={[styles["ingredient-card"], expiry.borderModifier]
                .filter(Boolean)
                .join(" ")}
        >
            <div className={styles["ingredient-card__header"]}>
                <h3 className={styles["ingredient-card__name"]}>
                    {displayName}
                </h3>
                <Chip variant={expiry.variant} icon={expiry.icon}>
                    {expiry.label}
                </Chip>
            </div>

            <div className={styles["ingredient-card__quantity"]}>
                {formatQuantity(ingredient.quantity_person_ingradient, locale)}
                <span className={styles["ingredient-card__unit"]}>
                    {unitName(
                        t,
                        ingredient.unit_name,
                        ingredient.quantity_person_ingradient,
                    )}
                </span>
            </div>

            <IngredientCardMeta ingredient={ingredient} />

            <div className={styles["ingredient-card__footer"]}>
                <button
                    type="button"
                    onClick={() => {
                        onOpenHistory(ingredient);
                    }}
                    className={styles["ingredient-card__details"]}
                >
                    {t("page.detailsButton")}
                </button>
                <div className={styles["ingredient-card__footer-actions"]}>
                    <button
                        type="button"
                        aria-label={t("page.restockButton")}
                        onClick={() => {
                            onRestock(ingredient);
                        }}
                        className={styles["ingredient-card__restock"]}
                    >
                        <BasketAddMark size={RESTOCK_ICON_SIZE} />
                    </button>
                    <button
                        type="button"
                        aria-label={t("page.deleteButton")}
                        onClick={() => {
                            onDelete(ingredient);
                        }}
                        className={styles["ingredient-card__delete"]}
                    >
                        <TrashMark size={DELETE_ICON_SIZE} />
                    </button>
                </div>
            </div>
        </div>
    );
};
