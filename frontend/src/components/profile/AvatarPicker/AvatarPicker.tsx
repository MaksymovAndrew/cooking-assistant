import React from "react";
import { useTranslation } from "react-i18next";

import { AVATAR_KEYS } from "constants/avatars";

import { Avatar } from "components/ui/Avatar";

import styles from "./AvatarPicker.module.scss";

interface AvatarPickerProps {
    value: string | null;
    onChange: (avatarKey: string | null) => void;
    initials?: string;
}

const OPTION_AVATAR_SIZE = 56;

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
    value,
    onChange,
    initials,
}) => {
    const { t } = useTranslation("profile");

    return (
        <div role="radiogroup" className={styles["avatar-picker"]}>
            <button
                type="button"
                role="radio"
                aria-checked={value === null}
                aria-label={t("editProfileModal.noAvatarOption")}
                onClick={() => {
                    onChange(null);
                }}
                className={[
                    styles["avatar-picker__option"],
                    value === null && styles["avatar-picker__option--selected"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <Avatar initials={initials} size={OPTION_AVATAR_SIZE} />
            </button>
            {AVATAR_KEYS.map((key) => (
                <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={value === key}
                    aria-label={key}
                    onClick={() => {
                        onChange(key);
                    }}
                    className={[
                        styles["avatar-picker__option"],
                        value === key &&
                            styles["avatar-picker__option--selected"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <Avatar avatarKey={key} size={OPTION_AVATAR_SIZE} />
                </button>
            ))}
        </div>
    );
};
