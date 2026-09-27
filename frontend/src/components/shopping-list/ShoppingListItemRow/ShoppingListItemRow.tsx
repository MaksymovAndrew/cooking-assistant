import React from "react";
import { useTranslation } from "react-i18next";

import type { ShoppingListItem } from "types/shoppingList";

import { flipTarget } from "hooks/useFlipAnimation";
import { useLocale } from "hooks/useLocale";
import type { MoveDirection } from "hooks/useShoppingList";

import { TrashMark } from "components/icons";

import {
    shoppingListItemName,
    shoppingListItemQuantity,
} from "utils/shoppingListItem";

import { ShoppingListCheckbox } from "./ShoppingListCheckbox";
import styles from "./ShoppingListItemRow.module.scss";
import { ShoppingListMoveButtons } from "./ShoppingListMoveButtons";

interface ShoppingListItemRowProps {
    item: ShoppingListItem;
    onToggle: (item: ShoppingListItem) => void;
    onRemove: (item: ShoppingListItem) => void;
    // null for a bought item, which keeps its place and can't be reordered
    onMove: ((item: ShoppingListItem, direction: MoveDirection) => void) | null;
    isFirst: boolean;
    isLast: boolean;
}

const TRASH_ICON_SIZE = 18;

export const ShoppingListItemRow: React.FC<ShoppingListItemRowProps> = ({
    item,
    onToggle,
    onRemove,
    onMove,
    isFirst,
    isLast,
}) => {
    const { t } = useTranslation("shoppingList");
    const locale = useLocale();
    const name = shoppingListItemName(t, item);
    const quantity = shoppingListItemQuantity(t, locale, item);
    const checkboxId = `shopping-list-item-${item.id}`;

    return (
        <li
            {...flipTarget(`item-${item.id}`)}
            className={[
                styles["shopping-list-item-row"],
                item.checked && styles["shopping-list-item-row--checked"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <ShoppingListCheckbox
                id={checkboxId}
                checked={item.checked}
                onChange={() => {
                    onToggle(item);
                }}
            />
            <label
                htmlFor={checkboxId}
                className={styles["shopping-list-item-row__body"]}
            >
                <span className={styles["shopping-list-item-row__title"]}>
                    <span className={styles["shopping-list-item-row__name"]}>
                        {name}
                    </span>
                    {quantity !== null && (
                        <span
                            className={
                                styles["shopping-list-item-row__quantity"]
                            }
                        >
                            {quantity}
                        </span>
                    )}
                </span>
                {item.note !== null && (
                    <span className={styles["shopping-list-item-row__note"]}>
                        {item.note}
                    </span>
                )}
            </label>
            <div className={styles["shopping-list-item-row__actions"]}>
                {onMove && (
                    <ShoppingListMoveButtons
                        name={name}
                        isFirst={isFirst}
                        isLast={isLast}
                        onMove={(direction) => {
                            onMove(item, direction);
                        }}
                    />
                )}
                <button
                    type="button"
                    aria-label={t("item.remove", { name })}
                    className={styles["shopping-list-item-row__remove"]}
                    onClick={() => {
                        onRemove(item);
                    }}
                >
                    <TrashMark size={TRASH_ICON_SIZE} />
                </button>
            </div>
        </li>
    );
};
