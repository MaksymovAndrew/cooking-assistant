import React from "react";
import { useTranslation } from "react-i18next";

import type { ShoppingListItem } from "types/shoppingList";

import type { MoveDirection } from "hooks/useShoppingList";

import { ShoppingListNotice } from "components/shopping-list/ShoppingListNotice";
import { ShoppingListSection } from "components/shopping-list/ShoppingListSection";
import { Button } from "components/ui/Button";

import styles from "./ShoppingListSections.module.scss";

interface ShoppingListSectionsProps {
    toBuy: ShoppingListItem[];
    bought: ShoppingListItem[];
    isClearing: boolean;
    // the page places each section in its own grid area
    toBuyClassName: string;
    boughtClassName: string;
    onToggle: (item: ShoppingListItem) => void;
    onRemove: (item: ShoppingListItem) => void;
    onMove: (item: ShoppingListItem, direction: MoveDirection) => void;
    onClearBought: () => void;
}

const TO_BUY_FLIP_ID = "section-to-buy";
const BOUGHT_FLIP_ID = "section-bought";

export const ShoppingListSections: React.FC<ShoppingListSectionsProps> = ({
    toBuy,
    bought,
    isClearing,
    toBuyClassName,
    boughtClassName,
    onToggle,
    onRemove,
    onMove,
    onClearBought,
}) => {
    const { t } = useTranslation("shoppingList");

    return (
        <>
            <ShoppingListSection
                flipId={TO_BUY_FLIP_ID}
                title={t("sections.toBuy")}
                items={toBuy}
                empty={
                    <ShoppingListNotice
                        tone="success"
                        title={t("empty.allBought")}
                        description={t("empty.allBoughtHint")}
                    />
                }
                className={toBuyClassName}
                onToggle={onToggle}
                onRemove={onRemove}
                onMove={onMove}
            />
            <ShoppingListSection
                flipId={BOUGHT_FLIP_ID}
                title={t("sections.bought")}
                items={bought}
                empty={<ShoppingListNotice title={t("sections.boughtEmpty")} />}
                action={
                    bought.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            loading={isClearing}
                            className={styles["shopping-list-sections__clear"]}
                            onClick={onClearBought}
                        >
                            {t("sections.clearBought")}
                        </Button>
                    )
                }
                className={[
                    boughtClassName,
                    bought.length === 0 &&
                        styles["shopping-list-sections__bought--empty"],
                ]
                    .filter(Boolean)
                    .join(" ")}
                onToggle={onToggle}
                onRemove={onRemove}
                onMove={null}
            />
        </>
    );
};
