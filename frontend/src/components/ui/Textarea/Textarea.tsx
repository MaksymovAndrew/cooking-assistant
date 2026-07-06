import React from "react";

import styles from "./Textarea.module.scss";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
    hasError = false,
    className,
    ...rest
}) => {
    const classNames = [
        styles.textarea,
        hasError && styles["textarea--error"],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return <textarea className={classNames} {...rest} />;
};
