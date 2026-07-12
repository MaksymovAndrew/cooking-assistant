import React from "react";
import { useTranslation } from "react-i18next";

import type { ExpiringIngredient } from "types/expiry";

import styles from "./ExpiringItem.module.scss";

interface ExpiringItemProps {
    item: ExpiringIngredient;
}

export const ExpiringItem: React.FC<ExpiringItemProps> = ({ item }) => {
    const { t } = useTranslation("home");
    const { tone, days } = item.status;

    const label =
        tone === "expired"
            ? t("expiringSoon.expired")
            : t("expiringSoon.daysLeft", { count: days });

    const rowClass = [styles["expiring-item"], styles[`expiring-item--${tone}`]]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rowClass}>
            <span className={styles["expiring-item__name"]}>{item.name}</span>
            <span className={styles["expiring-item__badge"]}>{label}</span>
        </div>
    );
};
