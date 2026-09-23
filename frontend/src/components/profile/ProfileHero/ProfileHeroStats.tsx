import React from "react";
import { useTranslation } from "react-i18next";

import { formatKcal } from "utils/calories";

import styles from "./ProfileHero.module.scss";

interface ProfileHeroStatsProps {
    recipesCount: number;
    menusCount: number;
    favouritesCount: number;
    kcalToday: number;
}

export const ProfileHeroStats: React.FC<ProfileHeroStatsProps> = ({
    recipesCount,
    menusCount,
    favouritesCount,
    kcalToday,
}) => {
    const { t } = useTranslation("profile");
    const stats = [
        { label: t("profilePage.recipesStat"), value: recipesCount },
        { label: t("profilePage.menusStat"), value: menusCount },
        { label: t("profilePage.favouritesStat"), value: favouritesCount },
        { label: t("profilePage.kcalTodayStat"), value: formatKcal(kcalToday) },
    ];

    return (
        <div className={styles["profile-hero__stats"]}>
            {stats.map(({ label, value }) => (
                <div key={label} className={styles["profile-hero__stat"]}>
                    <span className={styles["profile-hero__stat-value"]}>
                        {value}
                    </span>
                    <span className={styles["profile-hero__stat-label"]}>
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
};
