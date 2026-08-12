import { CloudOff } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import styles from "./OfflineModal.module.scss";

interface OfflineModalProps {
    modalId: string;
}

const ICON_SIZE = 26;

export const OfflineModal: React.FC<OfflineModalProps> = ({ modalId }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const handleClose = () => dispatch(closeModal(modalId));

    const heading = (
        <span className={styles["offline-modal__heading"]}>
            <span className={styles["offline-modal__icon"]}>
                <CloudOff size={ICON_SIZE} aria-hidden="true" />
            </span>
            <span>{t("offlineModal.title")}</span>
        </span>
    );

    return (
        <BaseModal
            onClose={handleClose}
            title={heading}
            footer={
                <Button variant="secondary" onClick={handleClose}>
                    {t("offlineModal.close")}
                </Button>
            }
        >
            <p className={styles["offline-modal__message"]}>
                {t("offlineModal.message")}
            </p>
        </BaseModal>
    );
};
