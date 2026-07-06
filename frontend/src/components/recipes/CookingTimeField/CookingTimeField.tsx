import React from "react";

import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

interface CookingTimeFieldProps {
    id: string;
    label: string;
    value: string;
    error: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const CookingTimeField: React.FC<CookingTimeFieldProps> = ({
    id,
    label,
    value,
    error,
    onChange,
    placeholder,
}) => (
    <FormField htmlFor={id} label={label} error={error}>
        <TextInput
            id={id}
            type="text"
            placeholder={placeholder}
            value={value}
            hasError={Boolean(error)}
            onChange={(e) => {
                onChange(e.target.value);
            }}
        />
    </FormField>
);
