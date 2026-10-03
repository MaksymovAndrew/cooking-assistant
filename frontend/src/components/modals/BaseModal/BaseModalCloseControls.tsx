import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";

import { useMediaQuery } from "hooks/useMediaQuery";

import styles from "./BaseModal.module.scss";

interface BaseModalCloseControlsProps {
    showCloseButton: boolean;
    onClose: () => void;
}

const CLOSE_ICON_SIZE = 16;

export const BaseModalCloseControls: React.FC<BaseModalCloseControlsProps> = ({
    showCloseButton,
    onClose,
}) => {
    const { t } = useTranslation();
    // rendered conditionally: a display:none button would still count in useFocusTrap's first/last
    const isBottomSheet = useMediaQuery(MOBILE_MEDIA_QUERY);

    return (
        <>
            {isBottomSheet && (
                <button
                    type="button"
                    aria-label={t("modal.closeSheet")}
                    className={styles["base-modal__handle"]}
                    onClick={onClose}
                />
            )}
            {showCloseButton && (
                <button
                    type="button"
                    aria-label={t("modal.close")}
                    className={styles["base-modal__close"]}
                    onClick={onClose}
                >
                    <X size={CLOSE_ICON_SIZE} aria-hidden="true" />
                </button>
            )}
        </>
    );
};
