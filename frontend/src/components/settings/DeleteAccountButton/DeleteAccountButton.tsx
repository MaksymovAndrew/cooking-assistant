import React from "react";
import { useTranslation } from "react-i18next";

import { logger } from "config/logger";

import { useHoldToConfirm } from "hooks/useHoldToConfirm";

import { cx } from "utils/cx";

import styles from "./DeleteAccountButton.module.scss";

interface DeleteAccountButtonProps {
    onConfirm: () => void;
}

const HOLD_DURATION_MS = 500;

// keyboard and screen-reader users can't hold, so Enter and Space open it at once
export const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({
    onConfirm,
}) => {
    const { t } = useTranslation("settings");
    const { isHolding, start, cancel } = useHoldToConfirm(
        HOLD_DURATION_MS,
        onConfirm,
    );

    return (
        <button
            type="button"
            aria-label={t("deleteAccountButton.label")}
            title={t("deleteAccountButton.holdInstruction")}
            className={cx(
                styles["delete-account-button"],
                isHolding && styles["delete-account-button--holding"],
            )}
            onPointerDown={(e) => {
                // best-effort: browsers (and jsdom) can refuse capture, which must not block the hold
                try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                } catch (error) {
                    logger.debug("pointer capture refused", error);
                }
                start();
            }}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onConfirm();
                }
            }}
        >
            <span
                className={styles["delete-account-button__fill"]}
                style={
                    isHolding
                        ? { animationDuration: `${HOLD_DURATION_MS}ms` }
                        : undefined
                }
                aria-hidden="true"
            />
            <span className={styles["delete-account-button__label"]}>
                {t("deleteAccountButton.action")}
            </span>
        </button>
    );
};
