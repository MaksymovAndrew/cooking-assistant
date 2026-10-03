"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { usePageTitle } from "hooks/usePageTitle";
import { useProfilePage } from "hooks/useProfilePage";

import { AppShell } from "components/layout/AppShell";
import { ProfileHero } from "components/profile/ProfileHero";
import { ProfileTabs } from "components/profile/ProfileTabs";

import styles from "./page.module.scss";
import { ProfileTabPanel } from "./ProfileTabPanel";

const ProfilePage: React.FC = () => {
    const { t } = useTranslation("profile");
    const dispatch = useAppDispatch();
    const profile = useProfilePage();
    const { currentUser } = profile;

    usePageTitle(t("common:nav.profile"));

    return (
        <AppShell>
            <div className={styles["profile-page"]}>
                <ProfileHero
                    name={currentUser?.name}
                    surname={currentUser?.surname}
                    login={currentUser?.login}
                    createdAt={currentUser?.created_at}
                    avatar={currentUser?.avatar}
                    avatarPhotoKey={currentUser?.avatar_photo_key}
                    recipesCount={profile.recipesCount}
                    menusCount={profile.menusCount}
                    favouritesCount={profile.favouritesCount}
                    kcalToday={profile.kcalToday}
                    onLogout={profile.openLogoutModal}
                    onEditProfile={() => {
                        if (currentUser) {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.editProfile,
                                    currentUser,
                                }),
                            );
                        }
                    }}
                />
                <ProfileTabs
                    activeTab={profile.activeTab}
                    onChange={profile.setActiveTab}
                    onLogout={profile.openLogoutModal}
                />
                <ProfileTabPanel profile={profile} />
            </div>
        </AppShell>
    );
};

export default ProfilePage;
