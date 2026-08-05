import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { menuDetailsPath } from "constants/routes";

import styles from "./GuestLandingMenuCard.module.scss";

interface GuestLandingMenuCardProps {
    id: number;
    title: string;
    description: string;
    recipeCount: number;
}

// a lighter card than the app's regular MenuCard (no rating row) - the guest landing mockup
// keeps this section to a course-count badge, title and description
export const GuestLandingMenuCard: React.FC<GuestLandingMenuCardProps> = ({
    id,
    title,
    description,
    recipeCount,
}) => {
    const { t } = useTranslation("guestLanding");

    return (
        <Link
            to={menuDetailsPath(id)}
            className={styles["guest-landing-menu-card"]}
        >
            <span className={styles["guest-landing-menu-card__badge"]}>
                {t("coursesCount", { count: recipeCount })}
            </span>
            <h3 className={styles["guest-landing-menu-card__title"]}>
                {title}
            </h3>
            <p className={styles["guest-landing-menu-card__description"]}>
                {description}
            </p>
        </Link>
    );
};
