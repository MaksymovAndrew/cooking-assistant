import { AlertCircle } from "lucide-react";
import React from "react";

import {
    fieldErrorId,
    fieldHintId,
    joinDescribedBy,
} from "utils/fieldDescription";

import styles from "./FormField.module.scss";
import { FormFieldContext } from "./formFieldContext";

interface FormFieldProps {
    label: string;
    htmlFor: string;
    error?: string | null;
    hint?: string | null;
    labelRight?: React.ReactNode;
    children: React.ReactNode;
}

const ERROR_ICON_SIZE = 14;

// a field error is not an alert: it is read with the field, and the form's summary banner announces
export const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    error,
    hint,
    labelRight,
    children,
}) => {
    const control = {
        describedBy: joinDescribedBy(
            hint ? fieldHintId(htmlFor) : null,
            error ? fieldErrorId(htmlFor) : null,
        ),
        invalid: Boolean(error),
    };

    return (
        <div className={styles["form-field"]}>
            <div className={styles["form-field__label-row"]}>
                <label
                    htmlFor={htmlFor}
                    className={styles["form-field__label"]}
                >
                    {label}
                </label>
                {labelRight}
            </div>
            <FormFieldContext value={control}>{children}</FormFieldContext>
            {hint && (
                <p
                    id={fieldHintId(htmlFor)}
                    className={styles["form-field__hint"]}
                >
                    {hint}
                </p>
            )}
            {error && (
                <p
                    id={fieldErrorId(htmlFor)}
                    className={styles["form-field__error"]}
                >
                    <AlertCircle size={ERROR_ICON_SIZE} aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
};
