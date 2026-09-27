import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import { FormField } from "components/ui/FormField";
import { Select } from "components/ui/Select";

import { menuCategoryName } from "utils/referenceLabels";

interface MenuCategorySelectProps {
    id: string;
    label: string;
    placeholder: string;
    categories: MenuCategory[];
    value: number | null;
    error: string | null;
    onChange: (id: number | null) => void;
}

export const MenuCategorySelect: React.FC<MenuCategorySelectProps> = ({
    id,
    label,
    placeholder,
    categories,
    value,
    error,
    onChange,
}) => {
    const { t } = useTranslation();

    return (
        <FormField htmlFor={id} label={label} error={error}>
            <Select
                id={id}
                value={value ?? ""}
                hasError={Boolean(error)}
                onChange={(e) => {
                    onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                    );
                }}
                required
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {categories.map((category) => (
                    <option
                        key={category.menu_category_id}
                        value={category.menu_category_id}
                    >
                        {menuCategoryName(t, category.category_name)}
                    </option>
                ))}
            </Select>
        </FormField>
    );
};
