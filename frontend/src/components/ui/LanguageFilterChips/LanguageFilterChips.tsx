import React from "react";

import { type Locale, LOCALE_NAMES, LOCALES } from "constants/locales";

import { FilterChipGroup } from "components/ui/FilterChipGroup";

interface LanguageFilterChipsProps {
    value: Locale[];
    onChange: (next: Locale[]) => void;
}

const OPTIONS = LOCALES.map((locale) => ({
    id: locale,
    label: LOCALE_NAMES[locale],
}));

// every language named in itself, the same as the language switcher
export const LanguageFilterChips: React.FC<LanguageFilterChipsProps> = ({
    value,
    onChange,
}) => <FilterChipGroup options={OPTIONS} value={value} onChange={onChange} />;
