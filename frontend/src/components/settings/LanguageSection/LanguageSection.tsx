import { Globe, Ruler } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { SegmentedControl } from "components/ui/SegmentedControl";

import styles from "./LanguageSection.module.scss";

const UNITS_OPTIONS = [
    { value: "metric", label: "Metric" },
    { value: "imperial", label: "Imperial" },
] as const;

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
            <SettingsRow
                icon={Ruler}
                title={t("languageSection.unitsTitle")}
                description={t("languageSection.unitsDescription")}
                disabled
            >
                <SegmentedControl
                    label={t("languageSection.unitsLabel")}
                    options={UNITS_OPTIONS}
                    value="metric"
                    onChange={() => undefined}
                />
            </SettingsRow>
        </SettingsSection>
    );
};
