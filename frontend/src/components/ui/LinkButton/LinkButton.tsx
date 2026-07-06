import React from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";

import type { ButtonSize, ButtonVariant } from "components/ui/Button";
import buttonStyles from "components/ui/Button/Button.module.scss";

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

// a navigation link styled like Button - kept as an <a> under the hood so
// right-click/open-in-new-tab keep working, unlike a button + onClick(navigate)
export const LinkButton: React.FC<LinkButtonProps> = ({
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
}) => {
    const classNames = [
        buttonStyles.button,
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Link className={classNames} {...rest}>
            {children}
        </Link>
    );
};
