import { Mail } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";

import styles from "./EmailVerificationBanner.module.scss";

interface EmailVerificationBannerProps {
    onSendEmail: () => void;
    isSendDisabled: boolean;
    onDismiss: () => void;
}

const ICON_SIZE = 17;

export const EmailVerificationBanner: React.FC<
    EmailVerificationBannerProps
> = ({ onSendEmail, isSendDisabled, onDismiss }) => {
    const { t } = useTranslation("home");

    return (
        <div className={styles["email-verification-banner"]} role="status">
            <Mail size={ICON_SIZE} aria-hidden="true" />
            <p className={styles["email-verification-banner__message"]}>
                {t("emailVerificationBanner.unverifiedMessage")}
            </p>
            <div className={styles["email-verification-banner__actions"]}>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onSendEmail}
                    disabled={isSendDisabled}
                >
                    {t("emailVerificationBanner.sendEmail")}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                >
                    {t("emailVerificationBanner.later")}
                </Button>
            </div>
        </div>
    );
};
