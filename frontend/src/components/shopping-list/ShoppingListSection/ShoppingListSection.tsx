import React from "react";

import type { MoveDirection } from "types/reorder";
import type { ShoppingListItem } from "types/shoppingList";

import { flipTarget } from "hooks/useFlipAnimation";

import { ShoppingListItemRow } from "components/shopping-list/ShoppingListItemRow";

import { cx } from "utils/cx";

import styles from "./ShoppingListSection.module.scss";

interface ShoppingListSectionProps {
    flipId: string;
    title: string;
    items: ShoppingListItem[];
    empty: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    onToggle: (item: ShoppingListItem) => void;
    onRemove: (item: ShoppingListItem) => void;
    onMove: ((item: ShoppingListItem, direction: MoveDirection) => void) | null;
}

const COUNT_DIGITS = 2;

export const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({
    flipId,
    title,
    items,
    empty,
    action,
    className,
    onToggle,
    onRemove,
    onMove,
}) => (
    <section
        {...flipTarget(flipId)}
        aria-label={title}
        className={cx(styles["shopping-list-section"], className)}
    >
        <div className={styles["shopping-list-section__header"]}>
            <h2 className={styles["shopping-list-section__title"]}>{title}</h2>
            <span className={styles["shopping-list-section__count"]}>
                {String(items.length).padStart(COUNT_DIGITS, "0")}
            </span>
            {action && (
                <div className={styles["shopping-list-section__action"]}>
                    {action}
                </div>
            )}
        </div>
        {items.length === 0 ? (
            empty
        ) : (
            <ul className={styles["shopping-list-section__list"]}>
                {items.map((item, index) => (
                    <ShoppingListItemRow
                        key={item.id}
                        item={item}
                        onToggle={onToggle}
                        onRemove={onRemove}
                        onMove={onMove}
                        isFirst={index === 0}
                        isLast={index === items.length - 1}
                    />
                ))}
            </ul>
        )}
    </section>
);
