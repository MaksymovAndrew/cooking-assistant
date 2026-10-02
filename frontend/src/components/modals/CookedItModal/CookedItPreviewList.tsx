import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import type { CookPreviewLine } from "utils/cookPreview";
import { resolveIngredientName } from "utils/ingredientName";
import { quantityWithUnit } from "utils/referenceLabels";

import styles from "./CookedItModal.module.scss";

interface CookedItPreviewListProps {
    lines: CookPreviewLine[];
}

export const CookedItPreviewList = ({ lines }: CookedItPreviewListProps) => {
    const { t } = useTranslation("ingredients");
    const locale = useLocale();

    if (lines.length === 0) {
        return (
            <p className={styles["cooked-it-modal__note"]}>
                {t("cookedItModal.nothingToDeduct")}
            </p>
        );
    }

    return (
        <ul className={styles["cooked-it-modal__list"]}>
            {lines.map((line) => (
                <li
                    key={line.ingredient_id}
                    className={styles["cooked-it-modal__row"]}
                >
                    <span className={styles["cooked-it-modal__name"]}>
                        {resolveIngredientName(t, line)}
                    </span>
                    <span className={styles["cooked-it-modal__amount"]}>
                        {quantityWithUnit(
                            t,
                            locale,
                            line.needed,
                            line.unit_name,
                        )}
                    </span>
                    {line.status === "missing" && (
                        <span
                            className={`${styles["cooked-it-modal__pill"]} ${styles["cooked-it-modal__pill--missing"]}`}
                        >
                            {t("cookedItModal.notInPantry")}
                        </span>
                    )}
                    {line.status === "partial" && (
                        <span className={styles["cooked-it-modal__pill"]}>
                            {t("cookedItModal.partial", {
                                amount: quantityWithUnit(
                                    t,
                                    locale,
                                    line.available,
                                    line.unit_name,
                                ),
                            })}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
};
