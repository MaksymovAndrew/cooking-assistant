import React from "react";

import type { RecipeTypeSummary } from "types/recipeType";

import { FormField } from "components/ui/FormField";
import { Select } from "components/ui/Select";

interface RecipeTypeSelectProps {
    id: string;
    label: string;
    placeholder: string;
    types: RecipeTypeSummary[];
    value: number | null;
    error: string | null;
    onChange: (id: number | null) => void;
}

export const RecipeTypeSelect: React.FC<RecipeTypeSelectProps> = ({
    id,
    label,
    placeholder,
    types,
    value,
    error,
    onChange,
}) => (
    <FormField htmlFor={id} label={label} error={error}>
        <Select
            id={id}
            value={value ?? ""}
            hasError={Boolean(error)}
            onChange={(e) => {
                onChange(e.target.value === "" ? null : Number(e.target.value));
            }}
            required
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {types.map((type) => (
                <option key={type.id} value={type.id}>
                    {type.type_name}
                </option>
            ))}
        </Select>
    </FormField>
);
