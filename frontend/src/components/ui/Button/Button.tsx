import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./Button.module.scss";

export type ButtonVariant =
    "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    loading?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: styles["button--primary"],
    secondary: styles["button--secondary"],
    ghost: styles["button--ghost"],
    danger: styles["button--danger"],
    link: styles["button--link"],
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: styles["button--sm"],
    md: styles["button--md"],
    lg: styles["button--lg"],
};

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    iconOnly = false,
    loading = false,
    disabled = false,
    className,
    children,
    type = "button",
    ...rest
}) => {
    const { t } = useTranslation();

    const classNames = [
        styles.button,
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        iconOnly && styles["button--icon-only"],
        loading && styles["button--loading"],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classNames}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? (
                <>
                    <span
                        className={styles.button__spinner}
                        aria-hidden="true"
                    />
                    {t("button.loading")}
                </>
            ) : (
                children
            )}
        </button>
    );
};
