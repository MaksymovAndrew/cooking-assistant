import { LogOut } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { EditMark } from "components/icons";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";

import { formatJoinedDate } from "utils/dateUtils";
import { getInitials } from "utils/getInitials";

import styles from "./ProfileHero.module.scss";

// no favourites data exists on the backend yet - a fixed decorative placeholder, like the recipe/menu rating counts
const FAVOURITES_COUNT = 15;

interface ProfileHeroProps {
    name?: string;
    surname?: string;
    login?: string;
    createdAt?: string;
    recipesCount: number;
    menusCount: number;
    onLogout: () => void;
}

const AVATAR_SIZE = 88;
const EDIT_ICON_SIZE = 13;
const LOGOUT_ICON_SIZE = 16;

export const ProfileHero: React.FC<ProfileHeroProps> = ({
    name,
    surname,
    login,
    createdAt,
    recipesCount,
    menusCount,
    onLogout,
}) => {
    const { t } = useTranslation("profile");
    const initials = name && surname ? getInitials(name, surname) : undefined;
    const displayName = name && surname ? `${name} ${surname}` : login;

    return (
        <div className={styles["profile-hero"]}>
            <Avatar initials={initials} size={AVATAR_SIZE} />
            <div className={styles["profile-hero__identity"]}>
                <h1 className={styles["profile-hero__name"]}>{displayName}</h1>
                {createdAt && (
                    <p className={styles["profile-hero__joined"]}>
                        {t("profilePage.joined", {
                            date: formatJoinedDate(createdAt),
                        })}
                    </p>
                )}
            </div>
            <button
                type="button"
                aria-label={t("profilePage.logoutButton")}
                onClick={onLogout}
                className={styles["profile-hero__mobile-logout"]}
            >
                <LogOut size={LOGOUT_ICON_SIZE} aria-hidden="true" />
            </button>
            <div className={styles["profile-hero__spacer"]} />
            <div className={styles["profile-hero__stats"]}>
                <div className={styles["profile-hero__stat"]}>
                    <span className={styles["profile-hero__stat-value"]}>
                        {recipesCount}
                    </span>
                    <span className={styles["profile-hero__stat-label"]}>
                        {t("profilePage.recipesStat")}
                    </span>
                </div>
                <div className={styles["profile-hero__stat"]}>
                    <span className={styles["profile-hero__stat-value"]}>
                        {menusCount}
                    </span>
                    <span className={styles["profile-hero__stat-label"]}>
                        {t("profilePage.menusStat")}
                    </span>
                </div>
                <div className={styles["profile-hero__stat"]}>
                    <span className={styles["profile-hero__stat-value"]}>
                        {FAVOURITES_COUNT}
                    </span>
                    <span className={styles["profile-hero__stat-label"]}>
                        {t("profilePage.favouritesStat")}
                    </span>
                </div>
            </div>
            <div className={styles["profile-hero__actions"]}>
                <Button
                    type="button"
                    variant="secondary"
                    disabled
                    className={styles["profile-hero__edit"]}
                >
                    <EditMark size={EDIT_ICON_SIZE} />
                    {t("profilePage.editProfileButton")}
                </Button>
            </div>
        </div>
    );
};
