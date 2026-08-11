import { useTranslation } from "react-i18next";

import { profileDietaryPath } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { AlertTriangleMark } from "components/icons/AlertTriangleMark";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import { formatKcal } from "utils/calories";

import styles from "./CalorieLimitModal.module.scss";

interface CalorieLimitModalProps {
    modalId: string;
    consumed: number;
    goal: number;
}

const ICON_SIZE = 20;

export const CalorieLimitModal = ({
    modalId,
    consumed,
    goal,
}: CalorieLimitModalProps) => {
    const { t } = useTranslation("calories");
    const dispatch = useAppDispatch();

    const handleClose = () => dispatch(closeModal(modalId));

    return (
        <BaseModal
            size="sm"
            title={
                <span className={styles["calorie-limit-modal__title"]}>
                    <AlertTriangleMark size={ICON_SIZE} />
                    {t("limitModal.title")}
                </span>
            }
            onClose={handleClose}
            footer={
                <>
                    <LinkButton
                        to={profileDietaryPath()}
                        variant="secondary"
                        onClick={handleClose}
                    >
                        {t("limitModal.adjustGoal")}
                    </LinkButton>
                    <Button onClick={handleClose}>
                        {t("limitModal.gotIt")}
                    </Button>
                </>
            }
        >
            <p className={styles["calorie-limit-modal__message"]}>
                {t("limitModal.message", {
                    consumed: formatKcal(consumed),
                    over: formatKcal(consumed - goal),
                    goal: formatKcal(goal),
                })}
            </p>
            <p className={styles["calorie-limit-modal__note"]}>
                {t("limitModal.note")}
            </p>
        </BaseModal>
    );
};
