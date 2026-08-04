import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./CalorieDisclaimer.module.scss";

const ICON_SIZE = 15;

export const CalorieDisclaimer: React.FC = () => {
    const { t } = useTranslation("calories");

    return (
        <p className={styles["calorie-disclaimer"]} role="note">
            <Info size={ICON_SIZE} aria-hidden="true" />
            {t("disclaimer")}
        </p>
    );
};
