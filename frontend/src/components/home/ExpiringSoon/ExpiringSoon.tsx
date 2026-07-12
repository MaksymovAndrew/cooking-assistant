import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { ExpiringIngredient } from "types/expiry";

import { ExpiringItem } from "components/home/ExpiringSoon/ExpiringItem";

import styles from "./ExpiringSoon.module.scss";

interface ExpiringSoonProps {
    items: ExpiringIngredient[];
}

export const ExpiringSoon: React.FC<ExpiringSoonProps> = ({ items }) => {
    const { t } = useTranslation("home");

    return (
        <section className={styles["expiring-soon"]}>
            <div className={styles["expiring-soon__header"]}>
                <span className={styles["expiring-soon__title"]}>
                    {t("expiringSoon.title")}
                </span>
                <Link
                    to={ROUTES.ingredients}
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
                disabled
                className={styles["expiring-soon__shopping-list"]}
            >
                {t("expiringSoon.addToShoppingList")}
            </button>
        </section>
    );
};
