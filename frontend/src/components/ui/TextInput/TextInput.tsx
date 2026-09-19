import React from "react";

import styles from "./TextInput.module.scss";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    ({ hasError = false, className, ...rest }, ref) => {
        const classNames = [
            styles["text-input"],
            hasError && styles["text-input--error"],
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return <input ref={ref} className={classNames} {...rest} />;
    },
);

TextInput.displayName = "TextInput";
