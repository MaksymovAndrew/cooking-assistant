import { KeyRound } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { TrashMark } from "components/icons";
import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { Button } from "components/ui/Button";

interface AccountSectionProps {
    onChangePassword: () => void;
    onDeleteAccount: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
    onChangePassword,
    onDeleteAccount,
}) => {
    const { t } = useTranslation("settings");

    return (
        <SettingsSection heading={t("accountSection.heading")}>
            <SettingsRow
                icon={KeyRound}
                title={t("accountSection.changePasswordTitle")}
                description={t("accountSection.changePasswordDescription")}
            >
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onChangePassword}
                >
                    {t("accountSection.changePasswordButton")}
                </Button>
            </SettingsRow>
            <SettingsRow
                icon={TrashMark}
                title={t("accountSection.deleteAccountTitle")}
                description={t("accountSection.deleteAccountDescription")}
                danger
            >
                <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={onDeleteAccount}
                >
                    {t("accountSection.deleteAccountButton")}
                </Button>
            </SettingsRow>
        </SettingsSection>
    );
};
