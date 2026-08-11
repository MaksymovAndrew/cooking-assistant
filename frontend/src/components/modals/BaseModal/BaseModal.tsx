import { X } from "lucide-react";
import React, { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";

import { MOBILE_MEDIA_QUERY } from "constants/breakpoints";

import { useEscapeKey } from "hooks/useEscapeKey";
import { useFocusTrap } from "hooks/useFocusTrap";
import { useMediaQuery } from "hooks/useMediaQuery";
import { useScrollLock } from "hooks/useScrollLock";

import styles from "./BaseModal.module.scss";

export type BaseModalSize = "sm" | "md" | "lg";

interface BaseModalProps {
    onClose: () => void;
    size?: BaseModalSize;
    title?: React.ReactNode;
    children: React.ReactNode;
    // sticky row of up to 2 right-aligned actions, rendered outside the scrolling body
    footer?: React.ReactNode;
    // only for modals with no footer buttons to close via - most modals already have one
    showCloseButton?: boolean;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
}

const CLOSE_ICON_SIZE = 16;

const SIZE_CLASS: Record<BaseModalSize, string> = {
    sm: styles["base-modal--sm"],
    md: styles["base-modal--md"],
    lg: styles["base-modal--lg"],
};

// no isOpen prop - visibility is owned by the caller (mounted = open)
export const BaseModal: React.FC<BaseModalProps> = ({
    onClose,
    size = "md",
    title,
    children,
    footer,
    showCloseButton = false,
    closeOnOverlay = true,
    closeOnEscape = true,
}) => {
    const { t } = useTranslation();
    const titleId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    // rendered conditionally, not just CSS-hidden - a display:none button would still match
    // useFocusTrap's selector and break the desktop focus trap's first/last calculation
    const isBottomSheet = useMediaQuery(MOBILE_MEDIA_QUERY);

    useEscapeKey(onClose, closeOnEscape);
    useFocusTrap(containerRef);
    useScrollLock(true);

    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            role="presentation"
            className={styles["base-modal-overlay"]}
            onClick={handleOverlayClick}
        >
            <div
                ref={containerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
                className={`${styles["base-modal"]} ${SIZE_CLASS[size]}`}
            >
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
                {title && (
                    <h2 id={titleId} className={styles["base-modal__title"]}>
                        {title}
                    </h2>
                )}
                {/* scrollbar lives here, not on the rounded outer box, so it can't poke past the corner */}
                <div className={styles["base-modal__scroll"]}>{children}</div>
                {footer && (
                    <div className={styles["base-modal__footer"]}>{footer}</div>
                )}
            </div>
        </div>
    );
};
