import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { ExpiringIngredient } from "types/expiry";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { AlertTriangleMark } from "components/icons/AlertTriangleMark";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./ExpiredIngredientsModal.module.scss";

interface ExpiredIngredientsModalProps {
    modalId: string;
    ingredients: ExpiringIngredient[];
}

const ICON_SIZE = 20;

export const ExpiredIngredientsModal = ({
    modalId,
    ingredients,
}: ExpiredIngredientsModalProps) => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();

    const handleClose = () => dispatch(closeModal(modalId));

    return (
        <BaseModal
            size="md"
            title={
                <span className={styles["expired-ingredients-modal__title"]}>
                    <AlertTriangleMark size={ICON_SIZE} />
                    {t("expiredNoticeModal.title")}
                </span>
            }
            onClose={handleClose}
        >
            <p className={styles["expired-ingredients-modal__message"]}>
                {t("expiredNoticeModal.message", {
                    count: ingredients.length,
                })}
            </p>
            <ul className={styles["expired-ingredients-modal__list"]}>
                {ingredients.map((ingredient) => (
                    <li key={ingredient.ingredientId}>
                        {resolveIngredientName(ingredient)}
                    </li>
                ))}
            </ul>
            <div className={styles["expired-ingredients-modal__footer"]}>
                <Button variant="secondary" onClick={handleClose}>
                    {t("expiredNoticeModal.close")}
                </Button>
                <LinkButton to={ROUTES.ingredients} onClick={handleClose}>
                    {t("expiredNoticeModal.goToPantry")}
                </LinkButton>
            </div>
        </BaseModal>
    );
};
