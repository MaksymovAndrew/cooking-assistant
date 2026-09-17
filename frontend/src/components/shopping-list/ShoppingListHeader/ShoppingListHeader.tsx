import React from "react";
import { useTranslation } from "react-i18next";

import { ShoppingListProgress } from "components/shopping-list/ShoppingListProgress";

import styles from "./ShoppingListHeader.module.scss";

interface ShoppingListHeaderProps {
    // null while there is no list to count - loading, error or empty
    counts: { toBuy: number; bought: number; total: number } | null;
}

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
    counts,
}) => {
    const { t } = useTranslation("shoppingList");

    return (
        <header className={styles["shopping-list-header"]}>
            <div className={styles["shopping-list-header__text"]}>
                <h1 className={styles["shopping-list-header__heading"]}>
                    {t("page.heading")}
                </h1>
                {counts && (
                    <p className={styles["shopping-list-header__meta"]}>
                        <span
                            className={styles["shopping-list-header__to-buy"]}
                        >
                            {t("page.toBuyCount", { count: counts.toBuy })}
                        </span>
                        <span
                            className={styles["shopping-list-header__summary"]}
                        >
                            {t("page.summary", {
                                bought: counts.bought,
                                total: counts.total,
                            })}
                        </span>
                    </p>
                )}
            </div>
            {counts && (
                <ShoppingListProgress
                    bought={counts.bought}
                    total={counts.total}
                />
            )}
        </header>
    );
};
