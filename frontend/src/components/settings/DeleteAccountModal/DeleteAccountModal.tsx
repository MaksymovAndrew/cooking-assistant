import { AlertTriangle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import styles from "./DeleteAccountModal.module.scss";

interface DeleteAccountModalProps {
    onClose: () => void;
}

const ICON_SIZE = 26;

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    onClose,
}) => {
    const { t } = useTranslation("settings");

    return (
        <BaseModal size="sm" onClose={onClose}>
            <div className={styles["delete-account-modal"]}>
                <span
                    className={styles["delete-account-modal__icon"]}
                    aria-hidden="true"
                >
                    <AlertTriangle size={ICON_SIZE} />
                </span>
                <h2 className={styles["delete-account-modal__title"]}>
                    {t("deleteAccountModal.title")}
                </h2>
                <p className={styles["delete-account-modal__message"]}>
                    {t("deleteAccountModal.message")}
                </p>
                <div className={styles["delete-account-modal__footer"]}>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t("deleteAccountModal.cancelButton")}
                    </Button>
                    <Button type="button" variant="danger" disabled>
                        {t("deleteAccountModal.confirmButton")}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
