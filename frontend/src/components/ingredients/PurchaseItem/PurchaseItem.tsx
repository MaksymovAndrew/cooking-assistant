import React from "react";
import { useTranslation } from "react-i18next";

import type { Purchase } from "types/userIngredient";

import { useLocale } from "hooks/useLocale";
import {
    MIN_PURCHASE_QUANTITY,
    usePurchaseItemEdit,
} from "hooks/usePurchaseItemEdit";

import { NumberInput } from "components/ui/NumberInput";

import { cx } from "utils/cx";
import { formatShortDate } from "utils/dateUtils";
import { isLotExpired } from "utils/expiry";
import { unitName } from "utils/referenceLabels";
import { formatQuantity } from "utils/roundQuantity";

import styles from "./PurchaseItem.module.scss";
import { PurchaseItemActions } from "./PurchaseItemActions";

interface PurchaseItemProps {
    purchase: Purchase;
    ingredientName: string;
    onQuantityChange: (id: number, quantity: number) => void;
    onSave: (id: number, quantity: number) => Promise<void>;
    onDelete: (id: number) => void;
}

export const PurchaseItem: React.FC<PurchaseItemProps> = ({
    purchase,
    ingredientName,
    onQuantityChange,
    onSave,
    onDelete,
}) => {
    const { t } = useTranslation("ingredients");
    const locale = useLocale();
    const expired = isLotExpired(
        purchase.days_to_expire,
        purchase.purchase_date,
    );
    const date = formatShortDate(purchase.purchase_date, locale);
    const {
        isEditing,
        startEditing,
        finishEditing,
        onKeyDown,
        inputRef,
        triggerRef,
        text,
        onChange,
    } = usePurchaseItemEdit(purchase, onQuantityChange, onSave);

    return (
        <li
            className={cx(
                styles["purchase-item"],
                expired && styles["purchase-item--expired"],
            )}
        >
            <span>{date}</span>
            {expired && (
                <span className={styles["purchase-item__sr-only"]}>
                    {t("expiryBadge.expired")}
                </span>
            )}
            <span className={styles["purchase-item__quantity-group"]}>
                {isEditing ? (
                    <NumberInput
                        ref={inputRef}
                        min={MIN_PURCHASE_QUANTITY}
                        aria-label={t("purchaseModal.quantityLabel", {
                            name: ingredientName,
                            date,
                        })}
                        className={styles["purchase-item__quantity"]}
                        value={text}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onBlur={finishEditing}
                    />
                ) : (
                    <span className={styles["purchase-item__value"]}>
                        {formatQuantity(purchase.quantity, locale)}
                    </span>
                )}
                <span>
                    {unitName(t, purchase.unit_name, purchase.quantity)}
                </span>
            </span>
            {!isEditing && (
                <PurchaseItemActions
                    ref={triggerRef}
                    onEdit={startEditing}
                    onDelete={() => {
                        onDelete(purchase.id);
                    }}
                />
            )}
        </li>
    );
};
