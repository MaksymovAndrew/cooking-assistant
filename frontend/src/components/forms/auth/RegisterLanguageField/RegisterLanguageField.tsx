import React from "react";

import {
    isLocale,
    LANGUAGE_FIELD_LABEL,
    LOCALE_NAMES,
    LOCALES,
} from "constants/locales";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useLocale } from "hooks/useLocale";
import { useSwitchLocale } from "hooks/useSwitchLocale";

import { FormField } from "components/ui/FormField";
import { Select } from "components/ui/Select";

const LANGUAGE_ID = "register-language";

// first in the form, since choosing reloads the page in that language; the account keeps it
export const RegisterLanguageField: React.FC = () => {
    const locale = useLocale();
    const switchLocale = useSwitchLocale();
    const isHydrated = useIsHydrated();

    return (
        <FormField htmlFor={LANGUAGE_ID} label={LANGUAGE_FIELD_LABEL}>
            <Select
                id={LANGUAGE_ID}
                value={locale}
                disabled={!isHydrated}
                onChange={(event) => {
                    const next = event.target.value;

                    if (isLocale(next)) {
                        void switchLocale(next);
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
};
