import React from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { TrashMark } from "components/icons";
import { Chip, type ChipVariant } from "components/ui/Chip";
import { NumberInput } from "components/ui/NumberInput";

import { formatDate } from "utils/dateUtils";
import { getExpiryStatus } from "utils/expiry";

import styles from "./IngredientCard.module.scss";

interface IngredientCardProps {
    ingredient: PantryIngredient;
    isEditingQuantity: boolean;
    onQuantityChange: (id: number, quantity: number) => void;
    onOpenHistory: (ingredient: PantryIngredient) => void;
    onDelete: (ingredient: PantryIngredient) => void;
}

const DELETE_ICON_SIZE = 15;

export const IngredientCard: React.FC<IngredientCardProps> = ({
    ingredient,
    isEditingQuantity,
    onQuantityChange,
    onOpenHistory,
    onDelete,
}) => {
    const { t, i18n } = useTranslation("ingredients");
    const status = getExpiryStatus(
        ingredient.days_to_expire,
        ingredient.purchase_date,
    );

    let expiryLabel: string;
    let expiryVariant: ChipVariant;

    if (status === null) {
        expiryLabel = t("expiryBadge.noExpiry");
        expiryVariant = "outline";
    } else if (status.tone === "expired") {
        expiryLabel = t("expiryBadge.expired");
        expiryVariant = "danger";
    } else if (status.tone === "warning") {
        expiryLabel = t("expiryBadge.daysLeft", { count: status.days });
        expiryVariant = "warning";
    } else {
        expiryLabel = t("expiryBadge.fresh");
        expiryVariant = "success";
    }

    return (
        <div className={styles["ingredient-card"]}>
            <div className={styles["ingredient-card__header"]}>
                <h3 className={styles["ingredient-card__name"]}>
                    {ingredient.ingredient_name}
                </h3>
                <Chip variant={expiryVariant}>{expiryLabel}</Chip>
            </div>

            {isEditingQuantity ? (
                <div className={styles["ingredient-card__quantity-edit"]}>
                    <NumberInput
                        min={0}
                        value={ingredient.quantity_person_ingradient}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);

                            if (!isNaN(value)) {
                                onQuantityChange(ingredient.id, value);
                            }
                        }}
                    />
                    <span>{ingredient.unit_name}</span>
                </div>
            ) : (
                <div className={styles["ingredient-card__quantity"]}>
                    {ingredient.quantity_person_ingradient}
                    <span className={styles["ingredient-card__unit"]}>
                        {ingredient.unit_name}
                    </span>
                </div>
            )}

            <dl className={styles["ingredient-card__meta"]}>
                <div className={styles["ingredient-card__meta-row"]}>
                    <dt>{t("page.allergens")}</dt>
                    <dd>{ingredient.allergens ?? "—"}</dd>
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
                            ? formatDate(
                                  ingredient.purchase_date,
                                  i18n.language,
                              )
                            : t("page.purchaseDateUnknown")}
                    </dd>
                </div>
            </dl>

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
                {!isEditingQuantity && (
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
                )}
            </div>
        </div>
    );
};
