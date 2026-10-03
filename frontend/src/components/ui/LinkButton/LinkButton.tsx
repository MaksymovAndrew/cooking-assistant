import React from "react";

import type { ButtonSize, ButtonVariant } from "components/ui/Button";
import buttonStyles from "components/ui/Button/Button.module.scss";
import type { LinkProps } from "components/ui/Link";
import { Link } from "components/ui/Link";

import { cx } from "utils/cx";

interface LinkButtonProps extends LinkProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: buttonStyles["button--primary"],
    secondary: buttonStyles["button--secondary"],
    ghost: buttonStyles["button--ghost"],
    danger: buttonStyles["button--danger"],
    link: buttonStyles["button--link"],
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: buttonStyles["button--sm"],
    md: buttonStyles["button--md"],
    lg: buttonStyles["button--lg"],
};

// a real <a> styled as a Button, so open-in-new-tab keeps working
export const LinkButton: React.FC<LinkButtonProps> = ({
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
}) => {
    const classNames = cx(
        buttonStyles.button,
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
    );

    return (
        <Link className={classNames} {...rest}>
            {children}
        </Link>
    );
};
