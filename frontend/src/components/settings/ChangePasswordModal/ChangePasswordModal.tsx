import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { useChangePasswordForm } from "hooks/useChangePasswordForm";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { PasswordInput } from "components/ui/PasswordInput";

import styles from "./ChangePasswordModal.module.scss";

interface ChangePasswordModalProps {
    modalId: string;
}

const CURRENT_PW_FIELD_ID = "settings-current-password";
const NEW_PW_FIELD_ID = "settings-new-password";
const CONFIRM_PW_FIELD_ID = "settings-confirm-password";
const FORM_ID = "change-password-form";

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    modalId,
}) => {
    const { t } = useTranslation("settings");
    const dispatch = useAppDispatch();
    const onClose = () => dispatch(closeModal(modalId));
    const form = useChangePasswordForm(onClose);
    // typed unknown to erase the promise, so the submit needs no void or catch
    const submitForm = (): unknown => form.handleSubmit();

    return (
        <BaseModal
            size="sm"
            title={t("changePasswordModal.title")}
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t("changePasswordModal.cancelButton")}
                    </Button>
                    <Button
                        type="submit"
                        form={FORM_ID}
                        loading={form.isSubmitting}
                    >
                        {t("changePasswordModal.saveButton")}
                    </Button>
                </>
            }
        >
            <form
                id={FORM_ID}
                className={styles["change-password-modal__form"]}
                onSubmit={(e) => {
                    e.preventDefault();
                    submitForm();
                }}
            >
                <FormField
                    htmlFor={CURRENT_PW_FIELD_ID}
                    label={t("changePasswordModal.currentPasswordLabel")}
                >
                    <PasswordInput
                        id={CURRENT_PW_FIELD_ID}
                        value={form.currentPassword}
                        hasError={Boolean(form.error)}
                        onChange={(e) => {
                            form.setCurrentPassword(e.target.value);
                        }}
                    />
                </FormField>
                <FormField
                    htmlFor={NEW_PW_FIELD_ID}
                    label={t("changePasswordModal.newPasswordLabel")}
                >
                    <PasswordInput
                        id={NEW_PW_FIELD_ID}
                        value={form.newPassword}
                        hasError={Boolean(form.error)}
                        onChange={(e) => {
                            form.setNewPassword(e.target.value);
                        }}
                    />
                </FormField>
                <FormField
                    htmlFor={CONFIRM_PW_FIELD_ID}
                    label={t("changePasswordModal.confirmPasswordLabel")}
                >
                    <PasswordInput
                        id={CONFIRM_PW_FIELD_ID}
                        value={form.confirmPassword}
                        hasError={Boolean(form.error)}
                        onChange={(e) => {
                            form.setConfirmPassword(e.target.value);
                        }}
                    />
                </FormField>
                {form.error && <FormErrorBanner message={form.error} />}
            </form>
        </BaseModal>
    );
};
