import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ProgressRing } from "components/ui/ProgressRing";

import styles from "./ShoppingListProgress.module.scss";

interface ShoppingListProgressProps {
    bought: number;
    total: number;
}

const RING_SIZE = 46;
const RING_THICKNESS = 5;
const CHECK_ICON_SIZE = 16;
const PERCENT = 100;

export const ShoppingListProgress: React.FC<ShoppingListProgressProps> = ({
    bought,
    total,
}) => {
    const { t } = useTranslation("shoppingList");
    const fraction = total === 0 ? 0 : bought / total;

    return (
        <div className={styles["shopping-list-progress"]}>
            <ProgressRing
                fraction={fraction}
                size={RING_SIZE}
                thickness={RING_THICKNESS}
                className={styles["shopping-list-progress__ring"]}
            >
                {fraction === 1 ? (
                    <Check
                        size={CHECK_ICON_SIZE}
                        strokeWidth={3}
                        aria-hidden="true"
                        className={styles["shopping-list-progress__check"]}
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className={styles["shopping-list-progress__percent"]}
                    >
                        {Math.round(fraction * PERCENT)}%
                    </span>
                )}
            </ProgressRing>
            <div className={styles["shopping-list-progress__text"]}>
                <span className={styles["shopping-list-progress__title"]}>
                    {t("progress.title")}
                </span>
                <span className={styles["shopping-list-progress__summary"]}>
                    {t("progress.summary", { bought, total })}
                </span>
            </div>
        </div>
    );
};
