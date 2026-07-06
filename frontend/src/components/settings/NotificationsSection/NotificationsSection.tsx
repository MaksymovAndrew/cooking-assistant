import { Bell } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { ToggleSwitch } from "components/ui/ToggleSwitch";

export const NotificationsSection: React.FC = () => {
    const { t } = useTranslation("settings");

    return (
        <SettingsSection heading={t("notificationsSection.heading")}>
            <SettingsRow
                icon={Bell}
                title={t("notificationsSection.expiryTitle")}
                description={t("notificationsSection.expiryDescription")}
                disabled
            >
                <ToggleSwitch
                    label={t("notificationsSection.expiryTitle")}
                    checked={false}
                    onChange={() => undefined}
                    disabled
                />
            </SettingsRow>
            <SettingsRow
                icon={Bell}
                title={t("notificationsSection.digestTitle")}
                description={t("notificationsSection.digestDescription")}
                disabled
            >
                <ToggleSwitch
                    label={t("notificationsSection.digestTitle")}
                    checked={false}
                    onChange={() => undefined}
                    disabled
                />
            </SettingsRow>
        </SettingsSection>
    );
};
