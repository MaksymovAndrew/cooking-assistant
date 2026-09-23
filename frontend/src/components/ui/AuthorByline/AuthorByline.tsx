import React from "react";
import { useTranslation } from "react-i18next";

import type { RecordAuthor } from "types/media";

import { Avatar } from "components/ui/Avatar";

import { getInitials } from "utils/getInitials";

import styles from "./AuthorByline.module.scss";

interface AuthorBylineProps {
    author: RecordAuthor;
    // sets the margins: the byline has none of its own, so it never races the caller's rule
    className: string;
}

const AVATAR_SIZE = 24;

export const AuthorByline: React.FC<AuthorBylineProps> = ({
    author,
    className,
}) => {
    const { t } = useTranslation("common");

    return (
        <p className={[styles["author-byline"], className].join(" ")}>
            <Avatar
                initials={getInitials(author.name, author.surname_initial)}
                size={AVATAR_SIZE}
                avatarKey={author.avatar}
                photoKey={author.avatar_photo_key}
            />
            {t("author.byline", {
                name: author.name,
                initial: author.surname_initial,
            })}
        </p>
    );
};
