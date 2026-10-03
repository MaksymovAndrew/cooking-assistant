import React from "react";
import { useTranslation } from "react-i18next";

import { usePurchaseHistory } from "hooks/usePurchaseHistory";

import { PurchaseItem } from "components/ingredients/PurchaseItem";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import { getQueryErrorMessage } from "utils/queryError";

import styles from "./PurchaseHistoryModal.module.scss";

interface PurchaseHistoryModalProps {
    ingredientId: number;
    ingredientName: string;
    onClose: () => void;
}

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({
    ingredientId,
    ingredientName,
    onClose,
}) => {
    const { t } = useTranslation("ingredients");
    const history = usePurchaseHistory(ingredientId, onClose);

    return (
        <BaseModal
            size="md"
            title={t("purchaseModal.title", { name: ingredientName })}
            onClose={onClose}
            footer={
                <Button type="button" onClick={onClose}>
                    {t("purchaseModal.closeButton")}
                </Button>
            }
        >
            {history.isLoading && <p>{t("purchaseModal.loading")}</p>}
            {history.isError && (
                <p className={styles["purchase-history-modal__error"]}>
                    {getQueryErrorMessage(t, history.error)}
                </p>
            )}
            {history.isEmpty && <p>{t("purchaseModal.noHistory")}</p>}
            {history.hasHistory && (
                <ul className={styles["purchase-history-modal__list"]}>
                    {history.items.map((purchase) => (
                        <PurchaseItem
                            key={purchase.id}
                            purchase={purchase}
                            ingredientName={ingredientName}
                            onQuantityChange={history.changeQuantity}
                            onSave={history.save}
                            onDelete={history.remove}
                        />
                    ))}
                </ul>
            )}
        </BaseModal>
    );
};
