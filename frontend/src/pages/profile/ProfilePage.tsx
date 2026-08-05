import { Heart } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { usePageTitle } from "hooks/usePageTitle";
import { PROFILE_TAB, useProfilePage } from "hooks/useProfilePage";

import { AppShell } from "components/layout/AppShell";
import { EditProfileModal } from "components/profile/EditProfileModal";
import { ProfileComingSoon } from "components/profile/ProfileComingSoon";
import { ProfileDietaryTab } from "components/profile/ProfileDietaryTab";
import { ProfileHero } from "components/profile/ProfileHero";
import { ProfileMenusTab } from "components/profile/ProfileMenusTab";
import { ProfileRecipesTab } from "components/profile/ProfileRecipesTab";
import { ProfileTabs } from "components/profile/ProfileTabs";

import styles from "./ProfilePage.module.scss";

const ProfilePage: React.FC = () => {
    const { t } = useTranslation("profile");
    const profile = useProfilePage();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    usePageTitle(t("common:nav.profile"));

    return (
        <AppShell>
            <div className={styles["profile-page"]}>
                <ProfileHero
                    name={profile.currentUser?.name}
                    surname={profile.currentUser?.surname}
                    login={profile.currentUser?.login}
                    createdAt={profile.currentUser?.created_at}
                    avatar={profile.currentUser?.avatar}
                    recipesCount={profile.recipesCount}
                    menusCount={profile.menusCount}
                    kcalToday={profile.kcalToday}
                    onLogout={profile.openLogoutModal}
                    onEditProfile={() => {
                        setIsEditProfileOpen(true);
                    }}
                />
                <ProfileTabs
                    activeTab={profile.activeTab}
                    onChange={profile.setActiveTab}
                    onLogout={profile.openLogoutModal}
                />

                {profile.activeTab === PROFILE_TAB.recipes && (
                    <ProfileRecipesTab
                        recipes={profile.recipes}
                        total={profile.recipesCount}
                        hasNextPage={profile.recipesHasNextPage}
                        isFetchingNextPage={profile.recipesIsFetchingNextPage}
                        fetchNextPage={() => {
                            profile
                                .fetchNextRecipesPage()
                                .catch(() => undefined);
                        }}
                    />
                )}
                {profile.activeTab === PROFILE_TAB.menus && (
                    <ProfileMenusTab
                        menus={profile.menus}
                        total={profile.menusCount}
                        hasNextPage={profile.menusHasNextPage}
                        isFetchingNextPage={profile.menusIsFetchingNextPage}
                        fetchNextPage={() => {
                            profile.fetchNextMenusPage().catch(() => undefined);
                        }}
                    />
                )}
                {profile.activeTab === PROFILE_TAB.favourites && (
                    <ProfileComingSoon
                        icon={Heart}
                        title={t("profilePage.favouritesTitle")}
                    />
                )}
                {profile.activeTab === PROFILE_TAB.dietary && (
                    <ProfileDietaryTab currentUser={profile.currentUser} />
                )}
            </div>

            {isEditProfileOpen && (
                <EditProfileModal
                    currentUser={profile.currentUser}
                    onClose={() => {
                        setIsEditProfileOpen(false);
                    }}
                />
            )}
        </AppShell>
    );
};

export default ProfilePage;
