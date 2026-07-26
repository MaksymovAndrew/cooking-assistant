import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Purchase } from "types/userIngredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { EditMark } from "components/icons";
import { NumberInput } from "components/ui/NumberInput";

import { formatShortDate } from "utils/dateUtils";
import { isExpired } from "utils/ingredientExpirationUtils";

import styles from "./PurchaseItem.module.scss";

interface PurchaseItemProps {
    purchase: Purchase;
    onQuantityChange: (id: number, quantity: number) => void;
    onSave: (id: number, quantity: number) => Promise<void>;
}

const EDIT_ICON_SIZE = 15;
// matches the backend's positive-quantity floor now that purchases can be fractional (kg, l)
const MIN_PURCHASE_QUANTITY = 0.01;

export const PurchaseItem: React.FC<PurchaseItemProps> = ({
    purchase,
    onQuantityChange,
    onSave,
}) => {
    const { t } = useTranslation("ingredients");
    const expired = isExpired(purchase.purchase_date, purchase.days_to_expire);
    // the quantity is read-only until the edit button is pressed, so an accidental scroll or
    // stray tap over the row can never change a saved purchase
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const quantity = useEditableQuantity(
        purchase.quantity,
        (value) => {
            onQuantityChange(purchase.id, value);
        },
        MIN_PURCHASE_QUANTITY,
    );

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    return (
        <li
            className={[
                styles["purchase-item"],
                expired && styles["purchase-item--expired"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <span>{formatShortDate(purchase.purchase_date)}</span>
            <span className={styles["purchase-item__quantity-group"]}>
                {isEditing ? (
                    <NumberInput
                        ref={inputRef}
                        min={MIN_PURCHASE_QUANTITY}
                        className={styles["purchase-item__quantity"]}
                        value={quantity.text}
                        onChange={quantity.onChange}
                        onBlur={() => {
                            const qty = quantity.onBlur();

                            setIsEditing(false);
                            onSave(purchase.id, qty).catch(() => undefined);
                        }}
                    />
                ) : (
                    <span className={styles["purchase-item__value"]}>
                        {purchase.quantity}
                    </span>
                )}
                <span>{purchase.unit_name}</span>
            </span>
            {!isEditing && (
                <button
                    type="button"
                    aria-label={t("purchaseModal.editButton")}
                    onClick={() => {
                        setIsEditing(true);
                    }}
                    className={styles["purchase-item__edit"]}
                >
                    <EditMark size={EDIT_ICON_SIZE} aria-hidden="true" />
                </button>
            )}
        </li>
    );
};
