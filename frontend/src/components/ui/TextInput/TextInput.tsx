import React from "react";

import styles from "./TextInput.module.scss";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
    hasError = false,
    className,
    ...rest
}) => {
    const classNames = [
        styles["text-input"],
        hasError && styles["text-input--error"],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <input className={classNames} {...rest} />;
};
