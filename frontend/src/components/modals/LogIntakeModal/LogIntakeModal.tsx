import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useLogCalorieIntakeMutation } from "redux/services/caloriesApi";
import { closeModal } from "redux/slices/uiSlice";

import { useCalorieBudget } from "hooks/useCalorieBudget";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import { formatKcal, scaleCaloriesForPortions } from "utils/calories";

import { LogIntakeBudget } from "./LogIntakeBudget";
import styles from "./LogIntakeModal.module.scss";
import { MIN_PORTIONS, PortionStepper } from "./PortionStepper";

interface LogIntakeModalProps {
    modalId: string;
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number;
    initialPortions?: number;
}

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

            <PortionStepper portions={portions} onChange={setPortions} />

            <LogIntakeBudget
                goal={goal}
                remaining={remaining}
                consumed={budget.consumed}
                projectedOver={projectedOver}
            />

            <p className={styles["log-intake-modal__total"]}>
                {t("logIntakeModal.totalLabel", { total: formatKcal(total) })}
            </p>
        </BaseModal>
    );
};
