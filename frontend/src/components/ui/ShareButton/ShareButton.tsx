import { Share2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useShareLink } from "hooks/useShareLink";

import styles from "./ShareButton.module.scss";

interface ShareButtonProps {
    // what the share sheet shows beside the link
    title: string;
    iconSize: number;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    title,
    iconSize,
}) => {
    const { t } = useTranslation("common");
    const isHydrated = useIsHydrated();
    const { share } = useShareLink();
    const label = t("share.button");

    return (
        <button
            type="button"
            onClick={() => {
                void share(title);
            }}
            disabled={!isHydrated}
            aria-label={label}
            className={styles["share-button"]}
        >
            <Share2 size={iconSize} aria-hidden="true" />
            <span className={styles["share-button__label"]}>{label}</span>
        </button>
    );
};
