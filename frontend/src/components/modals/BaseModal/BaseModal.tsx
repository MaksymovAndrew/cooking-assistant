import React, { useEffect, useId, useRef } from "react";

import styles from "./BaseModal.module.scss";

export type BaseModalSize = "sm" | "md" | "lg";

interface BaseModalProps {
    onClose: () => void;
    size?: BaseModalSize;
    title?: React.ReactNode;
    children: React.ReactNode;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
}

const SIZE_CLASS: Record<BaseModalSize, string> = {
    sm: styles["base-modal--sm"],
    md: styles["base-modal--md"],
    lg: styles["base-modal--lg"],
};

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// no isOpen prop - visibility is owned by the caller (mounted = open)
export const BaseModal: React.FC<BaseModalProps> = ({
    onClose,
    size = "md",
    title,
    children,
    closeOnOverlay = true,
    closeOnEscape = true,
}) => {
    const titleId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!closeOnEscape) {
            return undefined;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    // traps Tab navigation inside the modal so it can't escape to the page behind it
    useEffect(() => {
        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== "Tab") {
                return;
            }

            const container = containerRef.current;
            const focusable = container
                ? Array.from(
                      container.querySelectorAll<HTMLElement>(
                          FOCUSABLE_SELECTOR,
                      ),
                  )
                : [];

            if (focusable.length === 0) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleTabKey);

        return () => {
            document.removeEventListener("keydown", handleTabKey);
        };
    }, []);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
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
                <span
                    className={styles["base-modal__handle"]}
                    aria-hidden="true"
                />
                {title && (
                    <h2 id={titleId} className={styles["base-modal__title"]}>
                        {title}
                    </h2>
                )}
                {/* scrollbar lives here, not on the rounded outer box, so it can't poke past the corner */}
                <div className={styles["base-modal__scroll"]}>{children}</div>
            </div>
        </div>
    );
};
