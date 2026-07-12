import { KeyRound, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { TrashMark } from "components/icons";
import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { Button } from "components/ui/Button";
import { LinkButton } from "components/ui/LinkButton";

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
                icon={User}
                title={t("accountSection.profileTitle")}
                description={t("accountSection.profileDescription")}
            >
                <LinkButton to={ROUTES.profile} variant="secondary" size="sm">
                    {t("accountSection.openProfileButton")}
                </LinkButton>
            </SettingsRow>
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
