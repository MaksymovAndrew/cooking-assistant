import { AlertTriangle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDeleteAccountForm } from "hooks/useDeleteAccountForm";

import { LockoutNotice } from "components/forms/auth/LoginForm/LockoutNotice";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";

import styles from "./DeleteAccountModal.module.scss";

interface DeleteAccountModalProps {
    login: string;
    onClose: () => void;
}

const ICON_SIZE = 26;
const PW_FIELD_ID = "delete-account-password";

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    login,
    onClose,
}) => {
    const { t } = useTranslation("settings");
    const form = useDeleteAccountForm(login);
    // erases the promise (matches ChangePasswordModal) so a fire-and-forget submit needs no void/catch
    const submitForm = (): unknown => form.handleSubmit();

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
                <form
                    className={styles["delete-account-modal__form"]}
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitForm();
                    }}
                >
                    <FormField
                        htmlFor={PW_FIELD_ID}
                        label={t("deleteAccountModal.passwordLabel")}
                    >
                        <PasswordInput
                            id={PW_FIELD_ID}
                            value={form.password}
                            hasError={Boolean(form.error)}
                            disabled={form.isLocked}
                            onChange={(e) => {
                                form.setPassword(e.target.value);
                            }}
                        />
                    </FormField>
                    {form.isLocked && form.lockoutRemainingMs !== null ? (
                        <LockoutNotice
                            remainingMs={form.lockoutRemainingMs}
                            totalMs={form.lockoutTotalMs}
                        />
                    ) : (
                        form.error && <FormErrorBanner message={form.error} />
                    )}
                    <div className={styles["delete-account-modal__footer"]}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            {t("deleteAccountModal.cancelButton")}
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={form.isLocked}
                        >
                            {t("deleteAccountModal.confirmButton")}
                        </Button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};
