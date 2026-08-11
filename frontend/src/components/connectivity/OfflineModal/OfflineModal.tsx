import { CloudOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useOnlineStatus } from "hooks/useOnlineStatus";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import styles from "./OfflineModal.module.scss";

const ICON_SIZE = 26;

// shows once per online->offline transition; auto-closes on reconnect; doesn't re-nag while still offline after being dismissed
export const OfflineModal: React.FC = () => {
    const { t } = useTranslation();
    const isOnline = useOnlineStatus();
    const [dismissed, setDismissed] = useState(false);
    const wasOnline = useRef(isOnline);

    useEffect(() => {
        if (wasOnline.current && !isOnline) {
            setDismissed(false);
        }
        wasOnline.current = isOnline;
    }, [isOnline]);

    if (isOnline || dismissed) {
        return null;
    }

    const handleClose = () => {
        setDismissed(true);
    };

    const heading = (
        <span className={styles["offline-modal__heading"]}>
            <span className={styles["offline-modal__icon"]}>
                <CloudOff size={ICON_SIZE} aria-hidden="true" />
            </span>
            <span>{t("offlineModal.title")}</span>
        </span>
    );

    return (
        <BaseModal
            onClose={handleClose}
            title={heading}
            footer={
                <Button variant="secondary" onClick={handleClose}>
                    {t("offlineModal.close")}
                </Button>
            }
        >
            <p className={styles["offline-modal__message"]}>
                {t("offlineModal.message")}
            </p>
        </BaseModal>
    );
};
