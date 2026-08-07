import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { LinkButton } from "components/ui/LinkButton";

import styles from "./GuestLandingHero.module.scss";

export const GuestLandingHero: React.FC = () => {
    const { t } = useTranslation("guestLanding");

    return (
        <div className={styles["guest-landing-hero"]}>
            <span className={styles["guest-landing-hero__badge"]}>
                {t("badge")}
            </span>
            <h1 className={styles["guest-landing-hero__heading"]}>
                {t("heading")}
            </h1>
            <p
                className={`${styles["guest-landing-hero__description"]} ${styles["guest-landing-hero__description--full"]}`}
            >
                {t("descriptionFull")}
            </p>
            <p
                className={`${styles["guest-landing-hero__description"]} ${styles["guest-landing-hero__description--short"]}`}
            >
                {t("descriptionShort")}
            </p>
            <div className={styles["guest-landing-hero__actions"]}>
                <LinkButton to={ROUTES.registration}>
                    {t("common:nav.register")}
                </LinkButton>
                <LinkButton to={ROUTES.login} variant="secondary">
                    {t("common:nav.login")}
                </LinkButton>
            </div>
        </div>
    );
};
