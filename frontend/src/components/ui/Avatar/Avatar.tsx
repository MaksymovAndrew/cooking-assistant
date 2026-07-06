import React from "react";

import { UserCircleMark } from "components/icons";

import styles from "./Avatar.module.scss";

interface AvatarProps {
    initials?: string;
    size?: number;
}

const DEFAULT_SIZE = 40;
const ICON_SCALE = 0.5;

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = DEFAULT_SIZE,
}) => (
    <span className={styles.avatar} style={{ width: size, height: size }}>
        {initials ?? <UserCircleMark size={Math.round(size * ICON_SCALE)} />}
    </span>
);
