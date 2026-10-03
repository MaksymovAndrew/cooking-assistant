import React from "react";

import { useFormFieldAria } from "components/ui/FormField";

import { cx } from "utils/cx";

import styles from "./Textarea.module.scss";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
    hasError = false,
    className,
    ...rest
}) => {
    const fieldAria = useFormFieldAria(rest);
    const classNames = cx(
        styles.textarea,
        hasError && styles["textarea--error"],
        className,
    );

    return <textarea className={classNames} {...rest} {...fieldAria} />;
};
