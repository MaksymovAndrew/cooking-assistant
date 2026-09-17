import { Check, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { ShoppingListItem } from "types/shoppingList";

import { flipTarget } from "hooks/useFlipAnimation";
import type { MoveDirection } from "hooks/useShoppingList";

import { TrashMark } from "components/icons";

import {
    shoppingListItemName,
    shoppingListItemQuantity,
} from "utils/shoppingListItem";

import styles from "./ShoppingListItemRow.module.scss";

interface ShoppingListItemRowProps {
    item: ShoppingListItem;
    onToggle: (item: ShoppingListItem) => void;
    onRemove: (item: ShoppingListItem) => void;
    // null for a bought item, which keeps its place and can't be reordered
    onMove: ((item: ShoppingListItem, direction: MoveDirection) => void) | null;
    isFirst: boolean;
    isLast: boolean;
}

const MOVE_ICON_SIZE = 13;
const TRASH_ICON_SIZE = 18;
const CHECK_ICON_SIZE = 14;

export const ShoppingListItemRow: React.FC<ShoppingListItemRowProps> = ({
    item,
    onToggle,
    onRemove,
    onMove,
    isFirst,
    isLast,
}) => {
    const { t } = useTranslation("shoppingList");
    const name = shoppingListItemName(item);
    const quantity = shoppingListItemQuantity(item);
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
            <span className={styles["shopping-list-item-row__check"]}>
                <input
                    id={checkboxId}
                    type="checkbox"
                    checked={item.checked}
                    className={styles["shopping-list-item-row__input"]}
                    onChange={() => {
                        onToggle(item);
                    }}
                />
                <span
                    aria-hidden="true"
                    className={styles["shopping-list-item-row__box"]}
                >
                    <Check size={CHECK_ICON_SIZE} strokeWidth={3} />
                </span>
            </span>
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
                    <div className={styles["shopping-list-item-row__move"]}>
                        <button
                            type="button"
                            aria-label={t("item.moveUp", { name })}
                            disabled={isFirst}
                            className={
                                styles["shopping-list-item-row__move-button"]
                            }
                            onClick={() => {
                                onMove(item, -1);
                            }}
                        >
                            <ChevronUp
                                size={MOVE_ICON_SIZE}
                                strokeWidth={2.2}
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            type="button"
                            aria-label={t("item.moveDown", { name })}
                            disabled={isLast}
                            className={
                                styles["shopping-list-item-row__move-button"]
                            }
                            onClick={() => {
                                onMove(item, 1);
                            }}
                        >
                            <ChevronDown
                                size={MOVE_ICON_SIZE}
                                strokeWidth={2.2}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
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
