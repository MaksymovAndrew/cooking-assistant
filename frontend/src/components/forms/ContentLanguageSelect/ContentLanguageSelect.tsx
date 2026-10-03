import React from "react";

import {
    isLocale,
    type Locale,
    LOCALE_NAMES,
    LOCALES,
} from "constants/locales";

import { FormField } from "components/ui/FormField";
import { Select } from "components/ui/Select";

interface ContentLanguageSelectProps {
    id: string;
    label: string;
    value: Locale;
    onChange: (language: Locale) => void;
}

export const ContentLanguageSelect: React.FC<ContentLanguageSelectProps> = ({
    id,
    label,
    value,
    onChange,
}) => (
    <FormField htmlFor={id} label={label}>
        <Select
            id={id}
            value={value}
            onChange={(event) => {
                const next = event.target.value;

                if (isLocale(next)) {
                    onChange(next);
                }
            }}
        >
            {LOCALES.map((option) => (
                <option key={option} value={option} lang={option}>
                    {LOCALE_NAMES[option]}
                </option>
            ))}
        </Select>
    </FormField>
);
