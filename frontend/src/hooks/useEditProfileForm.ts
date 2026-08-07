import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useUpdateProfileMutation } from "redux/services/authApi";

export const useEditProfileForm = (
    currentUser: CurrentUser | null | undefined,
    onSuccess: () => void,
) => {
    const { t } = useTranslation("profile");
    const [updateProfile] = useUpdateProfileMutation();

    const [name, setName] = useState(currentUser?.name ?? "");
    const [surname, setSurname] = useState(currentUser?.surname ?? "");
    const [avatar, setAvatar] = useState<string | null>(
        currentUser?.avatar ?? null,
    );
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const hasEmptyField = !name.trim() || !surname.trim();

        if (hasEmptyField) {
            setError(t("editProfileModal.errors.allFieldsRequired"));

            return;
        }

        const result = await updateProfile({ name, surname, avatar });

        if ("data" in result) {
            onSuccess();

            return;
        }

        setError(t("editProfileModal.errors.genericError"));
    }, [avatar, name, onSuccess, surname, t, updateProfile]);

    return {
        name,
        setName,
        surname,
        setSurname,
        avatar,
        setAvatar,
        error,
        handleSubmit,
    };
};
