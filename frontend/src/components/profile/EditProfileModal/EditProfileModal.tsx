import React from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useAppDispatch } from "redux/hooks";
import { closeModal } from "redux/slices/uiSlice";

import { useEditProfileForm } from "hooks/useEditProfileForm";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

import { getInitials } from "utils/getInitials";

import { EditProfileAvatarFields } from "./EditProfileAvatarFields";
import styles from "./EditProfileModal.module.scss";

interface EditProfileModalProps {
    modalId: string;
    currentUser: CurrentUser;
}

const NAME_ID = "edit-profile-name";
const SURNAME_ID = "edit-profile-surname";
const FORM_ID = "edit-profile-form";

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    modalId,
    currentUser,
}) => {
    const { t } = useTranslation("profile");
    const dispatch = useAppDispatch();
    const onClose = () => dispatch(closeModal(modalId));
    const form = useEditProfileForm(currentUser, onClose);
    // typed unknown to erase the promise, so the submit needs no void or catch
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
                    <Button
                        type="submit"
                        form={FORM_ID}
                        loading={form.isSubmitting}
                    >
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
                <EditProfileAvatarFields
                    photo={form.photo}
                    avatar={form.avatar}
                    onAvatarChange={form.setAvatar}
                    initials={initials}
                />
                {form.error && <FormErrorBanner message={form.error} />}
            </form>
        </BaseModal>
    );
};
