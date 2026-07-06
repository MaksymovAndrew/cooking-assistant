import React, { useState } from "react";
import { useTranslation } from "react-i18next";

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
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

    return (
        <AppShell>
            <div className={styles["settings-page"]}>
                <h1 className={styles["settings-page__heading"]}>
                    {t("settingsPage.heading")}
                </h1>

                <AppearanceSection />
                <LanguageSection />
                <NotificationsSection />
                <AccountSection
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
                    onClose={() => {
                        setIsDeleteAccountOpen(false);
                    }}
                />
            )}
        </AppShell>
    );
};

export default SettingsPage;
