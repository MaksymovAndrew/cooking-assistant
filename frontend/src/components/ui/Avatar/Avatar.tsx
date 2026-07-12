import React from "react";

import { UserCircleMark } from "components/icons";

import styles from "./Avatar.module.scss";

interface AvatarProps {
    initials?: string;
    size?: number;
}

const DEFAULT_SIZE = 40;
const ICON_SCALE = 0.5;
// initials scale with the avatar (12px at the default 40px header size)
const INITIALS_SCALE = 0.3;

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = DEFAULT_SIZE,
}) => (
    <span
        className={styles.avatar}
        style={{
            width: size,
            height: size,
            fontSize: Math.round(size * INITIALS_SCALE),
        }}
    >
        {initials ?? <UserCircleMark size={Math.round(size * ICON_SCALE)} />}
    </span>
);
