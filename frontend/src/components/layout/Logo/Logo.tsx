import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { DonburiMarkProps } from "components/icons";
import {
    DonburiMarkCompact,
    DonburiMarkDetailed,
    DonburiMarkMinimal,
    DonburiMarkSimple,
    DonburiMarkStandard,
} from "components/icons";

import styles from "./Logo.module.scss";

type LogoVariant = "minimal" | "compact" | "simple" | "standard" | "detailed";

interface LogoProps {
    to?: string;
    withWordmark?: boolean;
    size?: number;
    variant?: LogoVariant;
}

const DEFAULT_SIZE = 28;

const MARK_BY_VARIANT: Record<LogoVariant, React.FC<DonburiMarkProps>> = {
    minimal: DonburiMarkMinimal,
    compact: DonburiMarkCompact,
    simple: DonburiMarkSimple,
    standard: DonburiMarkStandard,
    detailed: DonburiMarkDetailed,
};

export const Logo: React.FC<LogoProps> = ({
    to,
    withWordmark = true,
    size = DEFAULT_SIZE,
    variant = "detailed",
}) => {
    const { t } = useTranslation();
    const appName = t("appName");
    const Mark = MARK_BY_VARIANT[variant];

    const content = (
        <>
            <Mark size={size} />
            {withWordmark && (
                <span className={styles.logo__wordmark}>{appName}</span>
            )}
        </>
    );

    if (to) {
        return (
            <Link to={to} aria-label={appName} className={styles.logo}>
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
