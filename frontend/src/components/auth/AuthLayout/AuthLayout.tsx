import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { DonburiMarkDetailed } from "components/icons";
import { LanguageSwitcher } from "components/ui/LanguageSwitcher";
import { Link } from "components/ui/Link";

import styles from "./AuthLayout.module.scss";

interface AuthLayoutProps {
    tagline: string;
    description: string;
    brandIcon?: boolean;
    // off where the form asks for the language itself
    languageSwitcher?: boolean;
    children: React.ReactNode;
}

const BRAND_ICON_SIZE = 40;
const ILLUSTRATION_ICON_SIZE = 90;
const MOBILE_ICON_SIZE = 40;

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    tagline,
    description,
    brandIcon = false,
    languageSwitcher = true,
    children,
}) => {
    const { t } = useTranslation();

    return (
        <div className={styles["auth-layout"]}>
            <div className={styles["auth-layout__illustration"]}>
                <Link
                    href={ROUTES.home}
                    className={styles["auth-layout__brand"]}
                >
                    {brandIcon && (
                        <DonburiMarkDetailed size={BRAND_ICON_SIZE} />
                    )}
                    {t("appName")}
                </Link>
                <Link
                    href={ROUTES.home}
                    className={styles["auth-layout__icon-circle"]}
                >
                    <DonburiMarkDetailed size={ILLUSTRATION_ICON_SIZE} />
                </Link>
                <div className={styles["auth-layout__tagline"]}>
                    <p className={styles["auth-layout__tagline-heading"]}>
                        {tagline}
                    </p>
                    <p className={styles["auth-layout__tagline-description"]}>
                        {description}
                    </p>
                </div>
            </div>
            <div className={styles["auth-layout__panel"]}>
                {languageSwitcher && (
                    <div className={styles["auth-layout__language"]}>
                        <LanguageSwitcher />
                    </div>
                )}
                <Link
                    href={ROUTES.home}
                    className={styles["auth-layout__mobile-header"]}
                >
                    <span
                        className={styles["auth-layout__icon-circle--mobile"]}
                    >
                        <DonburiMarkDetailed size={MOBILE_ICON_SIZE} />
                    </span>
                    <span className={styles["auth-layout__brand-text"]}>
                        {t("appName")}
                    </span>
                </Link>
                <div className={styles["auth-layout__card"]}>{children}</div>
            </div>
        </div>
    );
};
