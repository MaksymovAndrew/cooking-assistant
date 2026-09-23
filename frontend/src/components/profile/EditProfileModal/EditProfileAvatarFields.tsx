import React from "react";
import { useTranslation } from "react-i18next";

import type { useAvatarPhotoDraft } from "hooks/useAvatarPhotoDraft";

import { AvatarPicker } from "components/profile/AvatarPicker";
import { PhotoField } from "components/ui/PhotoField";

import styles from "./EditProfileModal.module.scss";

interface EditProfileAvatarFieldsProps {
    photo: ReturnType<typeof useAvatarPhotoDraft>;
    avatar: string | null;
    onAvatarChange: (avatar: string | null) => void;
    initials?: string;
}

export const EditProfileAvatarFields: React.FC<
    EditProfileAvatarFieldsProps
> = ({ photo, avatar, onAvatarChange, initials }) => {
    const { t } = useTranslation("profile");

    return (
        <>
            <div className={styles["edit-profile-modal__avatar-section"]}>
                <span className={styles["edit-profile-modal__avatar-label"]}>
                    {t("editProfileModal.photoLabel")}
                </span>
                <PhotoField
                    shape="round"
                    src={photo.src}
                    alt={t("editProfileModal.photoAlt")}
                    error={photo.error}
                    onChoose={photo.choose}
                    onRemove={photo.remove}
                />
            </div>
            <div className={styles["edit-profile-modal__avatar-section"]}>
                <span className={styles["edit-profile-modal__avatar-label"]}>
                    {t("editProfileModal.avatarLabel")}
                </span>
                {photo.src && (
                    <p className={styles["edit-profile-modal__avatar-note"]}>
                        {t("editProfileModal.photoOverridesAvatar")}
                    </p>
                )}
                <AvatarPicker
                    value={avatar}
                    onChange={onAvatarChange}
                    initials={initials}
                />
            </div>
        </>
    );
};
