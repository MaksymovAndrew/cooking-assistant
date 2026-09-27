import { LogOut } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { EditMark } from "components/icons";
import { Avatar } from "components/ui/Avatar";
import { Button } from "components/ui/Button";

import { formatJoinedDate } from "utils/dateUtils";
import { personDisplayName, personInitials } from "utils/personName";

import styles from "./ProfileHero.module.scss";
import { ProfileHeroStats } from "./ProfileHeroStats";

interface ProfileHeroProps {
    name?: string;
    surname?: string;
    login?: string;
    createdAt?: string;
    avatar?: string | null;
    avatarPhotoKey?: string | null;
    recipesCount: number;
    menusCount: number;
    favouritesCount: number;
    kcalToday: number;
    onLogout: () => void;
    onEditProfile: () => void;
}

const AVATAR_SIZE = 88;
const EDIT_ICON_SIZE = 13;
const LOGOUT_ICON_SIZE = 16;

export const ProfileHero: React.FC<ProfileHeroProps> = ({
    name,
    surname,
    login,
    createdAt,
    avatar,
    avatarPhotoKey,
    recipesCount,
    menusCount,
    favouritesCount,
    kcalToday,
    onLogout,
    onEditProfile,
}) => {
    const { t } = useTranslation("profile");
    const locale = useLocale();
    const initials = personInitials({ name, surname });
    const displayName = personDisplayName({ name, surname, login });

    return (
        <div className={styles["profile-hero"]}>
            <Avatar
                initials={initials}
                size={AVATAR_SIZE}
                avatarKey={avatar}
                photoKey={avatarPhotoKey}
            />
            <div className={styles["profile-hero__identity"]}>
                <h1 className={styles["profile-hero__name"]}>{displayName}</h1>
                {createdAt && (
                    <p className={styles["profile-hero__joined"]}>
                        {t("profilePage.joined", {
                            date: formatJoinedDate(createdAt, locale),
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
            <ProfileHeroStats
                recipesCount={recipesCount}
                menusCount={menusCount}
                favouritesCount={favouritesCount}
                kcalToday={kcalToday}
            />
            <div className={styles["profile-hero__actions"]}>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onEditProfile}
                    className={styles["profile-hero__edit"]}
                >
                    <EditMark size={EDIT_ICON_SIZE} />
                    {t("profilePage.editProfileButton")}
                </Button>
            </div>
        </div>
    );
};
