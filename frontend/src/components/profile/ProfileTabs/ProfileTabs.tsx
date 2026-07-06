import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";

import type { ProfileTab } from "hooks/useProfilePage";
import { PROFILE_TAB } from "hooks/useProfilePage";

import styles from "./ProfileTabs.module.scss";

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

const TAB_KEYS: { tab: ProfileTab; labelKey: string }[] = [
    { tab: PROFILE_TAB.recipes, labelKey: "profilePage.recipesTab" },
    { tab: PROFILE_TAB.menus, labelKey: "profilePage.menusTab" },
    { tab: PROFILE_TAB.favourites, labelKey: "profilePage.favouritesTab" },
    { tab: PROFILE_TAB.dietary, labelKey: "profilePage.dietaryTab" },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onChange,
}) => {
    const { t } = useTranslation("profile");

    return (
        <div role="tablist" className={styles["profile-tabs"]}>
            {TAB_KEYS.map(({ tab, labelKey }) => (
                <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => {
                        onChange(tab);
                    }}
                    className={[
                        styles["profile-tabs__tab"],
                        activeTab === tab && styles["profile-tabs__tab--on"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {t(labelKey)}
                </button>
            ))}
            <Link to={ROUTES.settings} className={styles["profile-tabs__tab"]}>
                {t("profilePage.settingsTab")}
            </Link>
        </div>
    );
};
