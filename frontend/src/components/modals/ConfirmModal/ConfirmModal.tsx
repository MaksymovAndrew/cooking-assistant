import { AlertCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { TrashMark } from "components/icons";
import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import styles from "./ConfirmModal.module.scss";

export type ConfirmVariant = "danger" | "primary";

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isConfirmDisabled?: boolean;
    confirmVariant?: ConfirmVariant;
    error?: string | null;
}

// accepts both lucide-react icons and hand-authored components/icons/* glyphs
type ConfirmModalIcon = React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
}>;

const ICON_BY_VARIANT: Record<ConfirmVariant, ConfirmModalIcon> = {
    danger: TrashMark,
    primary: AlertCircle,
};

const ICON_SIZE = 26;

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmLabel,
    cancelLabel,
    isConfirmDisabled,
    confirmVariant = "danger",
    error,
}) => {
    const { t } = useTranslation();
    const Icon = ICON_BY_VARIANT[confirmVariant];

    const heading = (
        <span className={styles["confirm-modal__heading"]}>
            <span
                className={[
                    styles["confirm-modal__icon"],
                    styles[`confirm-modal__icon--${confirmVariant}`],
                ].join(" ")}
            >
                <Icon size={ICON_SIZE} aria-hidden="true" />
            </span>
            <span>{title}</span>
        </span>
    );

    return (
        <BaseModal onClose={onClose} title={heading}>
            <p className={styles["confirm-modal__message"]}>{message}</p>
            {error && <p className={styles["confirm-modal__error"]}>{error}</p>}
            <div className={styles["confirm-modal__actions"]}>
                <Button variant="secondary" onClick={onClose}>
                    {cancelLabel ?? t("modal.cancel")}
                </Button>
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    disabled={isConfirmDisabled}
                >
                    {confirmLabel ?? t("modal.confirm")}
                </Button>
            </div>
        </BaseModal>
    );
};
