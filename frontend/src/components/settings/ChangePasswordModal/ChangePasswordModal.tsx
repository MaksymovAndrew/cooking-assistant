import React from "react";
import { useTranslation } from "react-i18next";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";

import styles from "./ChangePasswordModal.module.scss";

interface ChangePasswordModalProps {
    onClose: () => void;
}

const CURRENT_PW_FIELD_ID = "settings-current-password";
const NEW_PW_FIELD_ID = "settings-new-password";
const CONFIRM_PW_FIELD_ID = "settings-confirm-password";

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    onClose,
}) => {
    const { t } = useTranslation("settings");

    return (
        <BaseModal
            size="sm"
            title={t("changePasswordModal.title")}
            onClose={onClose}
        >
            <p className={styles["change-password-modal__notice"]}>
                {t("changePasswordModal.notice")}
            </p>
            <form className={styles["change-password-modal__form"]}>
                <FormField
                    htmlFor={CURRENT_PW_FIELD_ID}
                    label={t("changePasswordModal.currentPasswordLabel")}
                >
                    <PasswordInput id={CURRENT_PW_FIELD_ID} disabled />
                </FormField>
                <FormField
                    htmlFor={NEW_PW_FIELD_ID}
                    label={t("changePasswordModal.newPasswordLabel")}
                >
                    <PasswordInput id={NEW_PW_FIELD_ID} disabled />
                </FormField>
                <FormField
                    htmlFor={CONFIRM_PW_FIELD_ID}
                    label={t("changePasswordModal.confirmPasswordLabel")}
                >
                    <PasswordInput id={CONFIRM_PW_FIELD_ID} disabled />
                </FormField>
            </form>
            <div className={styles["change-password-modal__footer"]}>
                <Button type="button" variant="secondary" onClick={onClose}>
                    {t("changePasswordModal.cancelButton")}
                </Button>
                <Button type="button" disabled>
                    {t("changePasswordModal.saveButton")}
                </Button>
            </div>
        </BaseModal>
    );
};
