import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useUpdateProfileMutation } from "redux/services/authApi";

import { useAvatarPhotoDraft } from "hooks/useAvatarPhotoDraft";

export const useEditProfileForm = (
    currentUser: CurrentUser | null | undefined,
    onSuccess: () => void,
) => {
    const { t } = useTranslation("profile");
    const [updateProfile, { isLoading: isSubmitting }] =
        useUpdateProfileMutation();

    const [name, setName] = useState(currentUser?.name ?? "");
    const [surname, setSurname] = useState(currentUser?.surname ?? "");
    const [avatar, setAvatar] = useState<string | null>(
        currentUser?.avatar ?? null,
    );
    const [error, setError] = useState<string | null>(null);
    const photo = useAvatarPhotoDraft(currentUser?.avatar_photo_key ?? null);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const hasEmptyField = !name.trim() || !surname.trim();

        if (hasEmptyField) {
            setError(t("editProfileModal.errors.allFieldsRequired"));

            return;
        }

        const result = await updateProfile({ name, surname, avatar });

        if ("data" in result) {
            await photo.commit();
            onSuccess();

            return;
        }

        setError(t("editProfileModal.errors.genericError"));
    }, [avatar, name, onSuccess, photo, surname, t, updateProfile]);

    return {
        name,
        setName,
        surname,
        setSurname,
        avatar,
        setAvatar,
        photo,
        error,
        handleSubmit,
        isSubmitting,
    };
};
