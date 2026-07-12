import { AlertTriangle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { formatCountdown } from "utils/loginLockout";

import styles from "./LockoutNotice.module.scss";

interface LockoutNoticeProps {
    remainingMs: number;
    totalMs: number | null;
}

const ICON_SIZE = 15;
const MAX_PERCENTAGE = 100;

export const LockoutNotice: React.FC<LockoutNoticeProps> = ({
    remainingMs,
    totalMs,
}) => {
    const { t } = useTranslation("auth");

    const percentage = totalMs
        ? Math.min(MAX_PERCENTAGE, (remainingMs / totalMs) * MAX_PERCENTAGE)
        : MAX_PERCENTAGE;

    return (
        <div className={styles["lockout-notice"]} role="alert">
            <div className={styles["lockout-notice__header"]}>
                <AlertTriangle size={ICON_SIZE} aria-hidden="true" />
                <span>{t("errors.lockoutHeading")}</span>
            </div>
            <p className={styles["lockout-notice__countdown"]}>
                {t("errors.lockoutPrefix")}{" "}
                <span className={styles["lockout-notice__countdown-time"]}>
                    {formatCountdown(remainingMs)}
                </span>
            </p>
            <div className={styles["lockout-notice__bar"]}>
                <div
                    className={styles["lockout-notice__bar-fill"]}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
