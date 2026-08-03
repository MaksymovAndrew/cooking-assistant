import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useGetMeQuery } from "redux/services/authApi";
import { useLogCalorieIntakeMutation } from "redux/services/caloriesApi";
import { closeModal } from "redux/slices/uiSlice";

import { AlertTriangleMark } from "components/icons";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import { formatKcal, scaleCaloriesForPortions } from "utils/calories";

import styles from "./LogIntakeModal.module.scss";

interface LogIntakeModalProps {
    modalId: string;
    recipeId?: number;
    menuId?: number;
    title: string;
    caloriesPerPortion: number;
}

const MIN_PORTIONS = 1;
const ICON_SIZE = 16;

export const LogIntakeModal = ({
    modalId,
    recipeId,
    menuId,
    title,
    caloriesPerPortion,
}: LogIntakeModalProps) => {
    const { t } = useTranslation("calories");
    const dispatch = useAppDispatch();
    const { data: currentUser } = useGetMeQuery(null);
    const [portions, setPortions] = useState(MIN_PORTIONS);
    const [logIntake, { isLoading }] = useLogCalorieIntakeMutation();

    const total = scaleCaloriesForPortions(caloriesPerPortion, portions);
    const mealLimit = currentUser?.meal_calorie_limit ?? null;
    const mealLimitOverage =
        mealLimit !== null && total > mealLimit ? total - mealLimit : null;

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

            <p className={styles["log-intake-modal__total"]}>
                {t("logIntakeModal.totalLabel", { total: formatKcal(total) })}
            </p>

            {mealLimitOverage !== null && (
                <p className={styles["log-intake-modal__warning"]}>
                    <AlertTriangleMark size={ICON_SIZE} />
                    {t("logIntakeModal.overMealLimit", {
                        over: formatKcal(mealLimitOverage),
                    })}
                </p>
            )}

            <div className={styles["log-intake-modal__footer"]}>
                <Button variant="secondary" onClick={handleClose}>
                    {t("logIntakeModal.cancel")}
                </Button>
                <Button
                    onClick={() => void handleConfirm()}
                    disabled={isLoading}
                >
                    {t("logIntakeModal.confirm")}
                </Button>
            </div>
        </BaseModal>
    );
};
