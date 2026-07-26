import React from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { TrashMark } from "components/icons";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { NumberInput } from "components/ui/NumberInput";

import { getExpiryStatus } from "utils/expiry";
import { resolvePantryIngredientName, resolveUnit } from "utils/ingredientName";

import { getExpiryPresentation } from "./getExpiryPresentation";
import styles from "./IngredientCard.module.scss";
import { IngredientCardMeta } from "./IngredientCardMeta";

interface IngredientCardProps {
    ingredient: PantryIngredient;
    isEditingQuantity: boolean;
    onQuantityChange: (id: number, quantity: number) => void;
    onSaveQuantity: (id: number) => void;
    onOpenHistory: (ingredient: PantryIngredient) => void;
    onDelete: (ingredient: PantryIngredient) => void;
}

const DELETE_ICON_SIZE = 15;

export const IngredientCard: React.FC<IngredientCardProps> = ({
    ingredient,
    isEditingQuantity,
    onQuantityChange,
    onSaveQuantity,
    onOpenHistory,
    onDelete,
}) => {
    const { t } = useTranslation("ingredients");
    const status = getExpiryStatus(
        ingredient.days_to_expire,
        ingredient.purchase_date,
    );
    const expiry = getExpiryPresentation(status, t);
    const displayName = resolvePantryIngredientName(ingredient);
    const displayUnit = resolveUnit(ingredient.unit_name);
    const quantity = useEditableQuantity(
        ingredient.quantity_person_ingradient,
        (value) => {
            onQuantityChange(ingredient.id, value);
        },
    );

    return (
        <div
            className={[
                styles["ingredient-card"],
                isEditingQuantity
                    ? styles["ingredient-card--editing"]
                    : expiry.borderModifier,
            ]
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

            {isEditingQuantity ? (
                <div className={styles["ingredient-card__quantity-edit"]}>
                    <NumberInput
                        min={0}
                        value={quantity.text}
                        onChange={quantity.onChange}
                        onBlur={quantity.onBlur}
                    />
                    <span>{displayUnit}</span>
                    <span className={styles["ingredient-card__editing-hint"]}>
                        {t("page.editModeActive")}
                    </span>
                </div>
            ) : (
                <div className={styles["ingredient-card__quantity"]}>
                    {ingredient.quantity_person_ingradient}
                    <span className={styles["ingredient-card__unit"]}>
                        {displayUnit}
                    </span>
                </div>
            )}

            <IngredientCardMeta ingredient={ingredient} />

            <div className={styles["ingredient-card__footer"]}>
                {isEditingQuantity ? (
                    <Button
                        type="button"
                        onClick={() => {
                            onSaveQuantity(ingredient.id);
                        }}
                        className={styles["ingredient-card__save"]}
                    >
                        {t("page.saveQuantityButton")}
                    </Button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                onOpenHistory(ingredient);
                            }}
                            className={styles["ingredient-card__details"]}
                        >
                            {t("page.detailsButton")}
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
                    </>
                )}
            </div>
        </div>
    );
};
