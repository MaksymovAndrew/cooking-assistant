import { LogOut } from "lucide-react";
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
    onLogout: () => void;
}

const TAB_KEYS: { tab: ProfileTab; labelKey: string }[] = [
    { tab: PROFILE_TAB.recipes, labelKey: "profilePage.recipesTab" },
    { tab: PROFILE_TAB.menus, labelKey: "profilePage.menusTab" },
    { tab: PROFILE_TAB.favourites, labelKey: "profilePage.favouritesTab" },
    { tab: PROFILE_TAB.dietary, labelKey: "profilePage.dietaryTab" },
];

const LOGOUT_ICON_SIZE = 14;

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onChange,
    onLogout,
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
            <div className={styles["profile-tabs__spacer"]} />
            <button
                type="button"
                onClick={onLogout}
                className={styles["profile-tabs__logout"]}
            >
                <LogOut size={LOGOUT_ICON_SIZE} aria-hidden="true" />
                {t("profilePage.logoutButton")}
            </button>
        </div>
    );
};
