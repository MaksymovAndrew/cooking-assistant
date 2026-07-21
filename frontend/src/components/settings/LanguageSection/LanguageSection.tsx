import { Globe } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";

import styles from "./LanguageSection.module.scss";

export const LanguageSection: React.FC = () => {
    const { t } = useTranslation("settings");

    return (
        <SettingsSection heading={t("languageSection.heading")}>
            <SettingsRow
                icon={Globe}
                title={t("languageSection.languageTitle")}
                description={t("languageSection.languageDescription")}
                disabled
            >
                <span className={styles["language-section__pill"]}>EN</span>
            </SettingsRow>
        </SettingsSection>
    );
};
