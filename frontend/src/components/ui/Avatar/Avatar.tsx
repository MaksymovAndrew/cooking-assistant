import React from "react";

import { AVATAR_REGISTRY } from "constants/avatars";

import { UserCircleMark } from "components/icons";

import styles from "./Avatar.module.scss";

interface AvatarProps {
    initials?: string;
    size?: number;
    avatarKey?: string | null;
}

const DEFAULT_SIZE = 40;
const ICON_SCALE = 0.5;
// initials scale with the avatar (12px at the default 40px header size)
const INITIALS_SCALE = 0.3;
// presets are drawn on 128px art with their own internal padding - a touch of
// breathing room against the round tile matches the other fallback glyphs
const PRESET_SCALE = 0.82;

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = DEFAULT_SIZE,
    avatarKey,
}) => {
    const PresetAvatar = avatarKey ? AVATAR_REGISTRY[avatarKey] : undefined;

    if (PresetAvatar) {
        return (
            <span
                data-testid="avatar-preset"
                className={[styles.avatar, styles["avatar--preset"]].join(" ")}
                style={{ width: size, height: size }}
            >
                <PresetAvatar size={Math.round(size * PRESET_SCALE)} />
            </span>
        );
    }

    return (
        <span
            className={styles.avatar}
            style={{
                width: size,
                height: size,
                fontSize: Math.round(size * INITIALS_SCALE),
            }}
        >
            {initials ?? (
                <UserCircleMark size={Math.round(size * ICON_SCALE)} />
            )}
        </span>
    );
};
