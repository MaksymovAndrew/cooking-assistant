import React from "react";

import type { Purchase } from "types/userIngredient";

import { NumberInput } from "components/ui/NumberInput";

import { formatShortDate } from "utils/dateUtils";
import { isExpired } from "utils/ingredientExpirationUtils";

import styles from "./PurchaseItem.module.scss";

interface PurchaseItemProps {
    purchase: Purchase;
    onQuantityChange: (id: number, quantity: number) => void;
    onSave: (id: number, quantity: number) => Promise<void>;
}

export const PurchaseItem: React.FC<PurchaseItemProps> = ({
    purchase,
    onQuantityChange,
    onSave,
}) => {
    const expired = isExpired(purchase.purchase_date, purchase.days_to_expire);

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
            <NumberInput
                min={1}
                className={styles["purchase-item__quantity"]}
                value={purchase.quantity}
                onChange={(e) => {
                    const qty = parseInt(e.target.value, 10);

                    if (!isNaN(qty)) {
                        onQuantityChange(purchase.id, qty);
                    }
                }}
                onBlur={(e) => {
                    const qty = parseInt(e.target.value, 10);

                    if (!isNaN(qty)) {
                        onSave(purchase.id, qty).catch(() => undefined);
                    }
                }}
            />
            <span>{purchase.unit_name}</span>
        </li>
    );
};
