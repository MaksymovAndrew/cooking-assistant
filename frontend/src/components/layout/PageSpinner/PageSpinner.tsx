import React from "react";
import { useTranslation } from "react-i18next";

import { DonburiMarkStandard } from "components/icons";

import styles from "./PageSpinner.module.scss";

const LOGO_SIZE = 32;

export const PageSpinner: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles["page-spinner"]} role="status">
            <span className={styles["page-spinner__ring"]}>
                <DonburiMarkStandard size={LOGO_SIZE} />
            </span>
            <span className={styles["page-spinner__wordmark"]}>
                {t("appName")}
            </span>
            <span className={styles["page-spinner__caption"]}>
                {t("pageSpinner.loading")}
            </span>
            <span className={styles["page-spinner__dots"]} aria-hidden="true">
                <span />
                <span />
                <span />
            </span>
        </div>
    );
};
