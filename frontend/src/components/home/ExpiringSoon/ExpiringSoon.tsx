import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { ExpiringIngredient } from "types/expiry";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";
import { useIsHydrated } from "hooks/useIsHydrated";

import { ExpiringItem } from "components/home/ExpiringSoon/ExpiringItem";
import { Link } from "components/ui/Link";

import styles from "./ExpiringSoon.module.scss";

interface ExpiringSoonProps {
    items: ExpiringIngredient[];
    // every urgent ingredient, including the ones past the shortened list
    restockItems: ExpiringIngredient[];
}

export const ExpiringSoon: React.FC<ExpiringSoonProps> = ({
    items,
    restockItems,
}) => {
    const { t } = useTranslation("home");
    const isHydrated = useIsHydrated();
    const { add, isAdding } = useAddToShoppingList();
    // how much to rebuy is the shopper's call, so the items go on the list by name
    const restockEntries = restockItems.map((item) => ({
        ingredient_id: item.ingredientId,
        quantity: null,
    }));
    const isAddDisabled =
        !isHydrated || isAdding || restockEntries.length === 0;

    return (
        <section className={styles["expiring-soon"]}>
            <div className={styles["expiring-soon__header"]}>
                <span className={styles["expiring-soon__title"]}>
                    {t("expiringSoon.title")}
                </span>
                <Link
                    href={ROUTES.ingredients}
                    className={styles["expiring-soon__link"]}
                >
                    {t("expiringSoon.pantryLink")}
                </Link>
            </div>
            {items.length > 0 ? (
                <div className={styles["expiring-soon__list"]}>
                    {items.map((item) => (
                        <ExpiringItem key={item.ingredientId} item={item} />
                    ))}
                </div>
            ) : (
                <p className={styles["expiring-soon__empty"]}>
                    {t("expiringSoon.empty")}
                </p>
            )}
            <button
                type="button"
                disabled={isAddDisabled}
                className={styles["expiring-soon__shopping-list"]}
                onClick={() => {
                    add(restockEntries);
                }}
            >
                {t("expiringSoon.addToShoppingList")}
            </button>
        </section>
    );
};
