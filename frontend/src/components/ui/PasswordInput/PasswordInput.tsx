import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./PasswordInput.module.scss";

interface PasswordInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> {
    hasError?: boolean;
}

const ICON_SIZE = 17;

export const PasswordInput: React.FC<PasswordInputProps> = ({
    hasError = false,
    className,
    ...rest
}) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    const inputClassNames = [
        styles["password-input__field"],
        hasError && styles["password-input__field--error"],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles["password-input"]}>
            <input
                type={visible ? "text" : "password"}
                className={inputClassNames}
                {...rest}
            />
            <button
                type="button"
                className={styles["password-input__toggle"]}
                aria-label={
                    visible ? t("passwordInput.hide") : t("passwordInput.show")
                }
                onClick={() => {
                    setVisible((prev) => !prev);
                }}
            >
                {visible ? (
                    <EyeOff size={ICON_SIZE} aria-hidden="true" />
                ) : (
                    <Eye size={ICON_SIZE} aria-hidden="true" />
                )}
            </button>
        </div>
    );
};
