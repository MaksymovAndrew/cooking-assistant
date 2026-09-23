import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { ExpiredPantryIngredient } from "types/expiry";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { AlertTriangleMark } from "components/icons/AlertTriangleMark";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import { ExpiredIngredientsList } from "./ExpiredIngredientsList";
import styles from "./ExpiredIngredientsModal.module.scss";

interface ExpiredIngredientsModalProps {
    modalId: string;
    ingredients: ExpiredPantryIngredient[];
}

const ICON_SIZE = 20;

export const ExpiredIngredientsModal = ({
    modalId,
    ingredients,
}: ExpiredIngredientsModalProps) => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();

    const handleClose = () => dispatch(closeModal(modalId));
    const lotCount = ingredients.reduce(
        (total, ingredient) => total + ingredient.lots.length,
        0,
    );

    return (
        <BaseModal
            size="lg"
            title={
                <span className={styles["expired-ingredients-modal__title"]}>
                    <AlertTriangleMark size={ICON_SIZE} />
                    {t("expiredNoticeModal.title")}
                </span>
            }
            onClose={handleClose}
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("expiredNoticeModal.close")}
                    </Button>
                    <LinkButton href={ROUTES.ingredients} onClick={handleClose}>
                        {t("expiredNoticeModal.goToPantry")}
                    </LinkButton>
                </>
            }
        >
            <p className={styles["expired-ingredients-modal__message"]}>
                {t("expiredNoticeModal.message", { count: lotCount })}
            </p>
            <ExpiredIngredientsList ingredients={ingredients} />
        </BaseModal>
    );
};
