import React from "react";
import { useTranslation } from "react-i18next";

import { MAIN_CONTENT_ID } from "constants/landmarks";

import styles from "./SkipLink.module.scss";

// focuses instead of following the hash: a history entry would trip the unsaved-changes back guard
export const SkipLink: React.FC = () => {
    const { t } = useTranslation();

    return (
        <a
            href={`#${MAIN_CONTENT_ID}`}
            className={styles["skip-link"]}
            onClick={(event) => {
                event.preventDefault();
                document.getElementById(MAIN_CONTENT_ID)?.focus();
            }}
        >
            {t("nav.skipToContent")}
        </a>
    );
};
