import { AlertCircle } from "lucide-react";
import React from "react";

import styles from "./FormField.module.scss";

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string | null;
    labelRight?: React.ReactNode;
    children: React.ReactNode;
}

const ERROR_ICON_SIZE = 14;

export const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    error,
    labelRight,
    children,
}) => (
    <div className={styles["form-field"]}>
        <div className={styles["form-field__label-row"]}>
            <label htmlFor={htmlFor} className={styles["form-field__label"]}>
                {label}
            </label>
            {labelRight}
        </div>
        {children}
        {error && (
            <p className={styles["form-field__error"]} role="alert">
                <AlertCircle size={ERROR_ICON_SIZE} aria-hidden="true" />
                {error}
            </p>
        )}
    </div>
);
