import { AlertCircle } from "lucide-react";
import React from "react";

import styles from "./FormField.module.scss";

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string | null;
    children: React.ReactNode;
}

const ERROR_ICON_SIZE = 14;

export const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    error,
    children,
}) => (
    <div className={styles["form-field"]}>
        <label htmlFor={htmlFor} className={styles["form-field__label"]}>
            {label}
        </label>
        {children}
        {error && (
            <p className={styles["form-field__error"]} role="alert">
                <AlertCircle size={ERROR_ICON_SIZE} aria-hidden="true" />
                {error}
            </p>
        )}
    </div>
);
