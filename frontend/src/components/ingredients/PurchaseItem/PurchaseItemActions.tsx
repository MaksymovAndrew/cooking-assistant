import type { Ref } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { EditMark, TrashMark } from "components/icons";

import styles from "./PurchaseItem.module.scss";

interface PurchaseItemActionsProps {
    // the edit button, which takes focus back once an edit is done
    ref: Ref<HTMLButtonElement>;
    onEdit: () => void;
    onDelete: () => void;
}

const ICON_SIZE = 15;

export const PurchaseItemActions: React.FC<PurchaseItemActionsProps> = ({
    ref,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <>
            <button
                ref={ref}
                type="button"
                aria-label={t("purchaseModal.editButton")}
                onClick={onEdit}
                className={styles["purchase-item__edit"]}
            >
                <EditMark size={ICON_SIZE} aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label={t("purchaseModal.deleteButton")}
                onClick={onDelete}
                className={styles["purchase-item__delete"]}
            >
                <TrashMark size={ICON_SIZE} />
            </button>
        </>
    );
};
