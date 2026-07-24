import React from "react";
import { useTranslation } from "react-i18next";

import { useHoldToConfirm } from "hooks/useHoldToConfirm";

import { TrashMark } from "components/icons";

import styles from "./DeleteAccountButton.module.scss";

interface DeleteAccountButtonProps {
    onConfirm: () => void;
}

const HOLD_DURATION_MS = 500;
const ICON_SIZE = 14;

// hold-to-confirm to open the delete-account modal, so it can't be triggered by an accidental tap/click; Enter/Space open it immediately for keyboard and screen-reader users, who cannot perform a hold gesture
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
            className={[
                styles["delete-account-button"],
                isHolding && styles["delete-account-button--holding"],
            ]
                .filter(Boolean)
                .join(" ")}
            onPointerDown={(e) => {
                // best-effort: keeps tracking a finger that slides off the button, but must
                // never block the hold itself - browsers reject capture for a pointer they
                // don't consider active (jsdom lacks the API entirely, real browsers can
                // still throw for it), and the timer starting is what actually matters
                try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                    // ignored - see comment above
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
                <TrashMark size={ICON_SIZE} />
                {t("deleteAccountButton.label")}
            </span>
        </button>
    );
};
