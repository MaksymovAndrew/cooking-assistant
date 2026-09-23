import React from "react";

import type { RegisterErrors, RegisterRequest } from "types/auth";

import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

type TextFieldKey = Exclude<keyof RegisterRequest, "password">;

interface RegisterTextFieldProps {
    field: TextFieldKey;
    id: string;
    label: string;
    type?: "text" | "email";
    values: RegisterRequest;
    errors: RegisterErrors;
    onFieldChange: (field: keyof RegisterRequest, value: string) => void;
}

export const RegisterTextField: React.FC<RegisterTextFieldProps> = ({
    field,
    id,
    label,
    type = "text",
    values,
    errors,
    onFieldChange,
}) => (
    <FormField htmlFor={id} label={label} error={errors[field]}>
        <TextInput
            id={id}
            type={type}
            value={values[field]}
            hasError={Boolean(errors[field])}
            onChange={(e) => {
                onFieldChange(field, e.target.value);
            }}
        />
    </FormField>
);
