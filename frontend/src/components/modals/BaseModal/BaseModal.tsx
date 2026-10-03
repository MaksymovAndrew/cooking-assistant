import React, { useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useDialogFocus } from "hooks/useDialogFocus";
import { useEscapeKey } from "hooks/useEscapeKey";
import { useFocusTrap } from "hooks/useFocusTrap";
import { useScrollLock } from "hooks/useScrollLock";

import styles from "./BaseModal.module.scss";
import { BaseModalCloseControls } from "./BaseModalCloseControls";

export type BaseModalSize = "sm" | "md" | "lg";

// a dialog has to be named: by its visible title, or by a label when it shows none
type BaseModalName =
    | {
          title: Exclude<React.ReactNode, boolean | null | undefined>;
          ariaLabel?: never;
      }
    | { title?: never; ariaLabel: string };

type BaseModalProps = BaseModalName & {
    onClose: () => void;
    size?: BaseModalSize;
    children: React.ReactNode;
    footer?: React.ReactNode;
    // only for a modal with no footer button that closes it
    showCloseButton?: boolean;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
};

const SIZE_CLASS: Record<BaseModalSize, string> = {
    sm: styles["base-modal--sm"],
    md: styles["base-modal--md"],
    lg: styles["base-modal--lg"],
};

export const BaseModal: React.FC<BaseModalProps> = ({
    onClose,
    size = "md",
    title,
    ariaLabel,
    children,
    footer,
    showCloseButton = false,
    closeOnOverlay = true,
    closeOnEscape = true,
}) => {
    const titleId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    useEscapeKey(onClose, closeOnEscape);
    useDialogFocus(containerRef);
    useFocusTrap(containerRef);
    useScrollLock(true);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    };

    // portalled out of the app root, which goes inert while the dialog is open
    return createPortal(
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
                aria-label={ariaLabel}
                tabIndex={-1}
                className={`${styles["base-modal"]} ${SIZE_CLASS[size]}`}
            >
                <BaseModalCloseControls
                    showCloseButton={showCloseButton}
                    onClose={onClose}
                />
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
        </div>,
        document.body,
    );
};
