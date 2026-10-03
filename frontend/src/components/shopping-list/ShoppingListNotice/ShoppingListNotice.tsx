import { Check } from "lucide-react";
import React from "react";

import styles from "./ShoppingListNotice.module.scss";

interface ShoppingListNoticeProps {
    title: string;
    description?: string;
    tone?: "success" | "muted";
}

const ICON_SIZE = 18;

export const ShoppingListNotice: React.FC<ShoppingListNoticeProps> = ({
    title,
    description,
    tone = "muted",
}) => (
    <div
        className={[
            styles["shopping-list-notice"],
            styles[`shopping-list-notice--${tone}`],
        ].join(" ")}
    >
        {tone === "success" && (
            <span className={styles["shopping-list-notice__icon"]}>
                <Check size={ICON_SIZE} strokeWidth={2.4} aria-hidden="true" />
            </span>
        )}
        <div>
            <p className={styles["shopping-list-notice__title"]}>{title}</p>
            {description && (
                <p className={styles["shopping-list-notice__description"]}>
                    {description}
                </p>
            )}
        </div>
    </div>
);
