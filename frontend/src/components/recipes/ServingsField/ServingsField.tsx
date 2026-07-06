import React from "react";

import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

interface ServingsFieldProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

export const ServingsField: React.FC<ServingsFieldProps> = ({
    id,
    label,
    placeholder,
    value,
    onChange,
}) => (
    <FormField htmlFor={id} label={label}>
        <TextInput
            id={id}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
                onChange(e.target.value);
            }}
        />
    </FormField>
);
