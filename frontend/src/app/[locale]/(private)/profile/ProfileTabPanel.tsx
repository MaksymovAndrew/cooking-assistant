import React from "react";

import type { useProfilePage } from "hooks/useProfilePage";
import { PROFILE_TAB } from "hooks/useProfilePage";

import { FoodPreferences } from "components/profile/FoodPreferences";
import { ProfileDietaryTab } from "components/profile/ProfileDietaryTab";
import { ProfileFavouritesTab } from "components/profile/ProfileFavouritesTab";
import { ProfileMenusTab } from "components/profile/ProfileMenusTab";
import { ProfileRecipesTab } from "components/profile/ProfileRecipesTab";
import { AsyncContent } from "components/ui/AsyncContent";

import styles from "./page.module.scss";

interface ProfileTabPanelProps {
    profile: ReturnType<typeof useProfilePage>;
}

export const ProfileTabPanel: React.FC<ProfileTabPanelProps> = ({
    profile,
}) => (
    <AsyncContent
        isLoading={profile.tabStatus.isLoading}
        isError={profile.tabStatus.isError}
        onRetry={profile.tabStatus.retry}
    >
        {profile.activeTab === PROFILE_TAB.recipes && (
            <ProfileRecipesTab
                recipes={profile.recipes}
                total={profile.recipesCount}
                hasNextPage={profile.recipesHasNextPage}
                isFetchingNextPage={profile.recipesIsFetchingNextPage}
                fetchNextPage={() => {
                    void profile.fetchNextRecipesPage();
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
                    void profile.fetchNextMenusPage();
                }}
            />
        )}
        {profile.activeTab === PROFILE_TAB.favourites && (
            <ProfileFavouritesTab
                recipes={profile.favouriteRecipes}
                menus={profile.favouriteMenus}
            />
        )}
        {profile.activeTab === PROFILE_TAB.dietary && (
            <div className={styles["profile-page__dietary"]}>
                <ProfileDietaryTab currentUser={profile.currentUser} />
                <FoodPreferences />
            </div>
        )}
    </AsyncContent>
);
