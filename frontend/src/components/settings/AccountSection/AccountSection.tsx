import { KeyRound, Mail, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { TrashMark } from "components/icons";
import { DeleteAccountButton } from "components/settings/DeleteAccountButton";
import { SettingsRow } from "components/settings/SettingsRow";
import { SettingsSection } from "components/settings/SettingsSection";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { LinkButton } from "components/ui/LinkButton";

import styles from "./AccountSection.module.scss";

interface AccountSectionProps {
    email: string;
    emailVerified: boolean;
    onResendVerification: () => void;
    isResendDisabled: boolean;
    onChangePassword: () => void;
    onDeleteAccount: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
    email,
    emailVerified,
    onResendVerification,
    isResendDisabled,
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
                icon={Mail}
                title={t("accountSection.emailTitle")}
                description={email}
            >
                <div className={styles["account-section__email-controls"]}>
                    {emailVerified ? (
                        <Chip variant="success">
                            {t("accountSection.verifiedBadge")}
                        </Chip>
                    ) : (
                        <>
                            <Chip variant="warning">
                                {t("accountSection.unverifiedBadge")}
                            </Chip>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={onResendVerification}
                                disabled={isResendDisabled}
                            >
                                {t("accountSection.sendEmailButton")}
                            </Button>
                        </>
                    )}
                </div>
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
                <DeleteAccountButton onConfirm={onDeleteAccount} />
            </SettingsRow>
        </SettingsSection>
    );
};
