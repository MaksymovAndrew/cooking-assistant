"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useGetMeQuery } from "redux/services/authApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { usePageTitle } from "hooks/usePageTitle";
import { useResendVerificationCooldown } from "hooks/useResendVerificationCooldown";

import { AppShell } from "components/layout/AppShell";
import { AccountSection } from "components/settings/AccountSection";
import { AppearanceSection } from "components/settings/AppearanceSection";
import { LanguageSection } from "components/settings/LanguageSection";
import { AsyncContent } from "components/ui/AsyncContent";

import { hasFailedWithoutData } from "utils/queryStatus";

import styles from "./page.module.scss";

const SettingsPage: React.FC = () => {
    const { t } = useTranslation("settings");
    const dispatch = useAppDispatch();
    const meQuery = useGetMeQuery(null);
    const currentUser = meQuery.data;
    const { send: sendVerificationEmail, isOnCooldown } =
        useResendVerificationCooldown();

    usePageTitle(t("settingsPage.heading"));

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
                <AsyncContent
                    isLoading={meQuery.isLoading}
                    isError={hasFailedWithoutData(meQuery)}
                    onRetry={() => {
                        void meQuery.refetch();
                    }}
                >
                    <AccountSection
                        email={currentUser?.email ?? ""}
                        emailVerified={Boolean(currentUser?.email_verified_at)}
                        onResendVerification={sendVerificationEmail}
                        isResendDisabled={isOnCooldown}
                        onChangePassword={() => {
                            dispatch(
                                openModal({ type: MODAL_TYPE.changePassword }),
                            );
                        }}
                        onSignOutEverywhere={() => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.signOutEverywhere,
                                }),
                            );
                        }}
                        onDeleteAccount={() => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.deleteAccount,
                                    login: currentUser?.login ?? "",
                                }),
                            );
                        }}
                    />
                </AsyncContent>
            </div>
        </AppShell>
    );
};

export default SettingsPage;
