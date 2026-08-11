import React from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useEditProfileForm } from "hooks/useEditProfileForm";

import { BaseModal } from "components/modals/BaseModal";
import { AvatarPicker } from "components/profile/AvatarPicker";
import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

import { getInitials } from "utils/getInitials";

import styles from "./EditProfileModal.module.scss";

interface EditProfileModalProps {
    currentUser?: CurrentUser | null;
    onClose: () => void;
}

const NAME_ID = "edit-profile-name";
const SURNAME_ID = "edit-profile-surname";
const FORM_ID = "edit-profile-form";

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    currentUser,
    onClose,
}) => {
    const { t } = useTranslation("profile");
    const form = useEditProfileForm(currentUser, onClose);
    // erases the promise (matches ChangePasswordModal) so a fire-and-forget submit needs no void/catch
    const submitForm = (): unknown => form.handleSubmit();
    const initials =
        form.name && form.surname
            ? getInitials(form.name, form.surname)
            : undefined;

    return (
        <BaseModal
            size="sm"
            title={t("editProfileModal.title")}
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t("editProfileModal.cancelButton")}
                    </Button>
                    <Button type="submit" form={FORM_ID}>
                        {t("editProfileModal.saveButton")}
                    </Button>
                </>
            }
        >
            <form
                id={FORM_ID}
                className={styles["edit-profile-modal__form"]}
                onSubmit={(e) => {
                    e.preventDefault();
                    submitForm();
                }}
            >
                <FormField
                    htmlFor={NAME_ID}
                    label={t("editProfileModal.nameLabel")}
                >
                    <TextInput
                        id={NAME_ID}
                        value={form.name}
                        onChange={(e) => {
                            form.setName(e.target.value);
                        }}
                    />
                </FormField>
                <FormField
                    htmlFor={SURNAME_ID}
                    label={t("editProfileModal.surnameLabel")}
                >
                    <TextInput
                        id={SURNAME_ID}
                        value={form.surname}
                        onChange={(e) => {
                            form.setSurname(e.target.value);
                        }}
                    />
                </FormField>
                <div className={styles["edit-profile-modal__avatar-section"]}>
                    <span
                        className={styles["edit-profile-modal__avatar-label"]}
                    >
                        {t("editProfileModal.avatarLabel")}
                    </span>
                    <AvatarPicker
                        value={form.avatar}
                        onChange={form.setAvatar}
                        initials={initials}
                    />
                </div>
                {form.error && <FormErrorBanner message={form.error} />}
            </form>
        </BaseModal>
    );
};
