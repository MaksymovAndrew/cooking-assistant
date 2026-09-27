import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { AlertTriangleMark } from "components/icons";

import { formatKcal, roundCalories } from "utils/calories";

import styles from "./LogIntakeModal.module.scss";

const ICON_SIZE = 16;

interface LogIntakeBudgetProps {
    goal: number | null;
    // raw (unclamped): a negative value means already over today
    remaining: number | null;
    consumed: number;
    projectedOver: number | null;
}

export const LogIntakeBudget = ({
    goal,
    remaining,
    consumed,
    projectedOver,
}: LogIntakeBudgetProps) => {
    const { t } = useTranslation("calories");
    const locale = useLocale();

    if (goal === null || remaining === null) {
        return null;
    }

    return (
        <div className={styles["log-intake-modal__budget"]}>
            <p className={styles["log-intake-modal__budget-summary"]}>
                {remaining < 0
                    ? t("dietaryTab.summaryOver", {
                          consumed: formatKcal(roundCalories(consumed), locale),
                          goal: formatKcal(goal, locale),
                          over: formatKcal(-roundCalories(remaining), locale),
                      })
                    : t("dietaryTab.summaryRemaining", {
                          consumed: formatKcal(roundCalories(consumed), locale),
                          goal: formatKcal(goal, locale),
                          remaining: formatKcal(
                              roundCalories(remaining),
                              locale,
                          ),
                      })}
            </p>
            {projectedOver !== null && (
                <p className={styles["log-intake-modal__warning"]}>
                    <AlertTriangleMark size={ICON_SIZE} />
                    {t("logIntakeModal.projectedOver", {
                        over: formatKcal(roundCalories(projectedOver), locale),
                    })}
                </p>
            )}
        </div>
    );
};
