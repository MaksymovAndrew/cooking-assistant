import { Globe } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { LanguageSwitcher } from "components/ui/LanguageSwitcher";

export const LanguageSection: React.FC = () => {
    const { t } = useTranslation("settings");

    return (
        <SettingsSection heading={t("languageSection.heading")}>
            <SettingsRow
                icon={Globe}
                title={t("languageSection.languageTitle")}
                description={t("languageSection.languageDescription")}
            >
                <LanguageSwitcher />
            </SettingsRow>
        </SettingsSection>
    );
};
