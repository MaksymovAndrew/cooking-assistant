import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { MoveDirection } from "hooks/useShoppingList";

import styles from "./ShoppingListItemRow.module.scss";

interface ShoppingListMoveButtonsProps {
    name: string;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: MoveDirection) => void;
}

const MOVE_ICON_SIZE = 13;

export const ShoppingListMoveButtons: React.FC<
    ShoppingListMoveButtonsProps
> = ({ name, isFirst, isLast, onMove }) => {
    const { t } = useTranslation("shoppingList");

    return (
        <div className={styles["shopping-list-item-row__move"]}>
            <button
                type="button"
                aria-label={t("item.moveUp", { name })}
                disabled={isFirst}
                className={styles["shopping-list-item-row__move-button"]}
                onClick={() => {
                    onMove(-1);
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
                className={styles["shopping-list-item-row__move-button"]}
                onClick={() => {
                    onMove(1);
                }}
            >
                <ChevronDown
                    size={MOVE_ICON_SIZE}
                    strokeWidth={2.2}
                    aria-hidden="true"
                />
            </button>
        </div>
    );
};
