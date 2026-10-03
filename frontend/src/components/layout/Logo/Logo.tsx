import React from "react";
import { useTranslation } from "react-i18next";

import { DonburiMarkDetailed } from "components/icons";
import { Link } from "components/ui/Link";

import styles from "./Logo.module.scss";

interface LogoProps {
    href?: string;
    withWordmark?: boolean;
    size?: number;
}

const DEFAULT_SIZE = 28;

export const Logo: React.FC<LogoProps> = ({
    href,
    withWordmark = true,
    size = DEFAULT_SIZE,
}) => {
    const { t } = useTranslation();
    const appName = t("appName");

    const content = (
        <>
            <DonburiMarkDetailed size={size} />
            {withWordmark && (
                <span className={styles.logo__wordmark}>{appName}</span>
            )}
        </>
    );

    if (href) {
        return (
            <Link href={href} aria-label={appName} className={styles.logo}>
                {content}
            </Link>
        );
    }

    return (
        <span aria-label={appName} className={styles.logo}>
            {content}
        </span>
    );
};
