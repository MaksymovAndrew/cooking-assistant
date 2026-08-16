import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { ExpiredPantryIngredient } from "types/expiry";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { AlertTriangleMark } from "components/icons/AlertTriangleMark";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

import { formatShortDate } from "utils/dateUtils";
import { resolveIngredientName, resolveUnit } from "utils/ingredientName";

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
                    <LinkButton to={ROUTES.ingredients} onClick={handleClose}>
                        {t("expiredNoticeModal.goToPantry")}
                    </LinkButton>
                </>
            }
        >
            <p className={styles["expired-ingredients-modal__message"]}>
                {t("expiredNoticeModal.message", { count: lotCount })}
            </p>
            <ul className={styles["expired-ingredients-modal__list"]}>
                {ingredients.map((ingredient) => (
                    <li
                        key={ingredient.ingredientId}
                        className={styles["expired-ingredients-modal__group"]}
                    >
                        <span
                            className={
                                styles["expired-ingredients-modal__name"]
                            }
                        >
                            {resolveIngredientName(ingredient)}
                        </span>
                        <ul
                            className={
                                styles["expired-ingredients-modal__lots"]
                            }
                        >
                            {ingredient.lots.map((lot) => (
                                <li
                                    key={lot.purchaseDate}
                                    className={
                                        styles["expired-ingredients-modal__lot"]
                                    }
                                >
                                    <span>
                                        {t("expiredNoticeModal.lotQuantity", {
                                            quantity: lot.quantity,
                                            unit: resolveUnit(
                                                ingredient.unitName,
                                            ),
                                        })}
                                    </span>
                                    <span>
                                        {t("expiredNoticeModal.lotPurchased", {
                                            date: formatShortDate(
                                                lot.purchaseDate,
                                            ),
                                        })}
                                    </span>
                                    <span>
                                        {t("expiredNoticeModal.lotExpired", {
                                            date: formatShortDate(
                                                lot.expiryDate,
                                            ),
                                        })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </BaseModal>
    );
};
