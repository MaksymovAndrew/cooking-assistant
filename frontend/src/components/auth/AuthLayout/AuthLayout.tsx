import React from "react";
import { useTranslation } from "react-i18next";

import { DonburiMarkDetailed } from "components/icons";

import styles from "./AuthLayout.module.scss";

interface AuthLayoutProps {
    tagline: string;
    description: string;
    brandIcon?: boolean;
    children: React.ReactNode;
}

const BRAND_ICON_SIZE = 40;
const ILLUSTRATION_ICON_SIZE = 90;
const MOBILE_ICON_SIZE = 40;

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    tagline,
    description,
    brandIcon = false,
    children,
}) => {
    const { t } = useTranslation();

    return (
        <div className={styles["auth-layout"]}>
            <div className={styles["auth-layout__illustration"]}>
                <span className={styles["auth-layout__brand"]}>
                    {brandIcon && (
                        <DonburiMarkDetailed size={BRAND_ICON_SIZE} />
                    )}
                    {t("appName")}
                </span>
                <span className={styles["auth-layout__icon-circle"]}>
                    <DonburiMarkDetailed size={ILLUSTRATION_ICON_SIZE} />
                </span>
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
                <div className={styles["auth-layout__mobile-header"]}>
                    <span
                        className={styles["auth-layout__icon-circle--mobile"]}
                    >
                        <DonburiMarkDetailed size={MOBILE_ICON_SIZE} />
                    </span>
                    <span className={styles["auth-layout__brand-text"]}>
                        {t("appName")}
                    </span>
                </div>
                <div className={styles["auth-layout__card"]}>{children}</div>
            </div>
        </div>
    );
};
