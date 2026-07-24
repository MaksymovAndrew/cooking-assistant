import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetMeQuery } from "redux/services/authApi";

import { useResendVerificationCooldown } from "hooks/useResendVerificationCooldown";

import { AppShell } from "components/layout/AppShell";
import { AccountSection } from "components/settings/AccountSection";
import { AppearanceSection } from "components/settings/AppearanceSection";
import { ChangePasswordModal } from "components/settings/ChangePasswordModal";
import { DeleteAccountModal } from "components/settings/DeleteAccountModal";
import { LanguageSection } from "components/settings/LanguageSection";
import { NotificationsSection } from "components/settings/NotificationsSection";

import styles from "./SettingsPage.module.scss";

const SettingsPage: React.FC = () => {
    const { t } = useTranslation("settings");
    const { data: currentUser } = useGetMeQuery(null);
    const { send: sendVerificationEmail, isOnCooldown } =
        useResendVerificationCooldown();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

    return (
        <AppShell>
            <div className={styles["settings-page"]}>
                <h1 className={styles["settings-page__heading"]}>
                    {t("settingsPage.heading")}
                </h1>
                <p className={styles["settings-page__subtitle"]}>
                    {t("settingsPage.subheading")}
                </p>

                <AppearanceSection />
                <LanguageSection />
                <NotificationsSection />
                <AccountSection
                    email={currentUser?.email ?? ""}
                    emailVerified={Boolean(currentUser?.email_verified_at)}
                    onResendVerification={sendVerificationEmail}
                    isResendDisabled={isOnCooldown}
                    onChangePassword={() => {
                        setIsChangePasswordOpen(true);
                    }}
                    onDeleteAccount={() => {
                        setIsDeleteAccountOpen(true);
                    }}
                />
            </div>

            {isChangePasswordOpen && (
                <ChangePasswordModal
                    onClose={() => {
                        setIsChangePasswordOpen(false);
                    }}
                />
            )}
            {isDeleteAccountOpen && (
                <DeleteAccountModal
                    login={currentUser?.login ?? ""}
                    onClose={() => {
                        setIsDeleteAccountOpen(false);
                    }}
                />
            )}
        </AppShell>
    );
};

export default SettingsPage;
