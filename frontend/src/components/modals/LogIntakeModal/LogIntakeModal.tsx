import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useLogCalorieIntakeMutation } from "redux/services/caloriesApi";
import { closeModal } from "redux/slices/uiSlice";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import { AlertTriangleMark } from "components/icons";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import {
    formatKcal,
    roundCalories,
    scaleCaloriesForPortions,
} from "utils/calories";

import styles from "./LogIntakeModal.module.scss";

interface LogIntakeModalProps {
    modalId: string;
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number;
    initialPortions?: number;
}

const MIN_PORTIONS = 1;
const ICON_SIZE = 16;

export const LogIntakeModal = ({
    modalId,
    recipeId,
    menuId,
    title,
    caloriesPerPortion,
    initialPortions,
}: LogIntakeModalProps) => {
    const { t } = useTranslation("calories");
    const dispatch = useAppDispatch();
    const [portions, setPortions] = useState(initialPortions ?? MIN_PORTIONS);
    const [logIntake, { isLoading }] = useLogCalorieIntakeMutation();
    const budget = useCalorieBudget();

    const total = scaleCaloriesForPortions(caloriesPerPortion, portions);
    const goal = budget.goal;
    // raw (unclamped) remaining - a negative value here means already over today, which
    // this entry's total only adds to, so the same "> remaining" check covers both cases
    const remaining = budget.remaining;
    const projectedOver =
        remaining !== null && total > remaining ? total - remaining : null;

    const handleClose = () => dispatch(closeModal(modalId));

    const handleConfirm = async () => {
        // success toast is handled by the global listener
        const result = await logIntake({
            recipe_id: recipeId,
            menu_id: menuId,
            portions,
        });

        if ("data" in result) {
            handleClose();
        }
    };

    return (
        <BaseModal
            size="sm"
            title={t("logIntakeModal.title")}
            onClose={handleClose}
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("logIntakeModal.cancel")}
                    </Button>
                    <Button
                        onClick={() => void handleConfirm()}
                        disabled={isLoading}
                    >
                        {t("logIntakeModal.confirm")}
                    </Button>
                </>
            }
        >
            <p className={styles["log-intake-modal__title"]}>{title}</p>

            <div className={styles["log-intake-modal__stepper"]}>
                <span className={styles["log-intake-modal__stepper-label"]}>
                    {t("logIntakeModal.portionsLabel")}
                </span>
                <div className={styles["log-intake-modal__stepper-control"]}>
                    <button
                        type="button"
                        aria-label={t("logIntakeModal.fewerPortions")}
                        onClick={() => {
                            setPortions((count) =>
                                Math.max(MIN_PORTIONS, count - 1),
                            );
                        }}
                    >
                        −
                    </button>
                    <span>{portions}</span>
                    <button
                        type="button"
                        aria-label={t("logIntakeModal.morePortions")}
                        onClick={() => {
                            setPortions((count) => count + 1);
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            {goal !== null && remaining !== null && (
                <div className={styles["log-intake-modal__budget"]}>
                    <p className={styles["log-intake-modal__budget-summary"]}>
                        {remaining < 0
                            ? t("dietaryTab.summaryOver", {
                                  consumed: formatKcal(
                                      roundCalories(budget.consumed),
                                  ),
                                  goal: formatKcal(goal),
                                  over: formatKcal(-roundCalories(remaining)),
                              })
                            : t("dietaryTab.summaryRemaining", {
                                  consumed: formatKcal(
                                      roundCalories(budget.consumed),
                                  ),
                                  goal: formatKcal(goal),
                                  remaining: formatKcal(
                                      roundCalories(remaining),
                                  ),
                              })}
                    </p>
                    {projectedOver !== null && (
                        <p className={styles["log-intake-modal__warning"]}>
                            <AlertTriangleMark size={ICON_SIZE} />
                            {t("logIntakeModal.projectedOver", {
                                over: formatKcal(roundCalories(projectedOver)),
                            })}
                        </p>
                    )}
                </div>
            )}

            <p className={styles["log-intake-modal__total"]}>
                {t("logIntakeModal.totalLabel", { total: formatKcal(total) })}
            </p>
        </BaseModal>
    );
};
