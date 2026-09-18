import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ShoppingListSkeleton.module.scss";

// widths vary per row so the placeholder reads as a list rather than a grid
const ROWS = [
    { name: "62%", note: "40%" },
    { name: "48%", note: null },
    { name: "72%", note: "30%" },
    { name: "55%", note: null },
];

export const ShoppingListSkeleton: React.FC = () => {
    const { t } = useTranslation("shoppingList");

    return (
        <div
            role="status"
            aria-label={t("page.loading")}
            className={styles["shopping-list-skeleton"]}
        >
            <span className={styles["shopping-list-skeleton__heading"]} />
            {ROWS.map((row) => (
                <div
                    key={row.name}
                    className={styles["shopping-list-skeleton__row"]}
                >
                    <span className={styles["shopping-list-skeleton__box"]} />
                    <div className={styles["shopping-list-skeleton__lines"]}>
                        <span
                            className={styles["shopping-list-skeleton__line"]}
                            style={{ width: row.name }}
                        />
                        {row.note && (
                            <span
                                className={[
                                    styles["shopping-list-skeleton__line"],
                                    styles[
                                        "shopping-list-skeleton__line--note"
                                    ],
                                ].join(" ")}
                                style={{ width: row.note }}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
