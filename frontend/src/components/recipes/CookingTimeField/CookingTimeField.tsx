import React from "react";
import { useTranslation } from "react-i18next";

import { FormField } from "components/ui/FormField";
import { NumberInput } from "components/ui/NumberInput";

import styles from "./CookingTimeField.module.scss";

interface CookingTimeFieldProps {
    id: string;
    label: string;
    hours: string;
    minutes: string;
    error: string | null;
    onHoursChange: (value: string) => void;
    onMinutesChange: (value: string) => void;
}

const MAX_HOURS = 99;
const MAX_MINUTES = 59;

export const CookingTimeField: React.FC<CookingTimeFieldProps> = ({
    id,
    label,
    hours,
    minutes,
    error,
    onHoursChange,
    onMinutesChange,
}) => {
    const { t } = useTranslation("recipes");

    return (
        <FormField htmlFor={`${id}-hours`} label={label} error={error}>
            <div className={styles["cooking-time-field"]}>
                <div className={styles["cooking-time-field__input"]}>
                    <NumberInput
                        id={`${id}-hours`}
                        min={0}
                        max={MAX_HOURS}
                        hasError={Boolean(error)}
                        value={hours}
                        onChange={(e) => {
                            onHoursChange(e.target.value);
                        }}
                    />
                    <span className={styles["cooking-time-field__unit"]}>
                        {t("recipeForm.hoursUnit")}
                    </span>
                </div>
                <span className={styles["cooking-time-field__separator"]}>
                    :
                </span>
                <div className={styles["cooking-time-field__input"]}>
                    <NumberInput
                        id={`${id}-minutes`}
                        aria-label={t("recipeForm.minutesLabel")}
                        min={0}
                        max={MAX_MINUTES}
                        hasError={Boolean(error)}
                        value={minutes}
                        onChange={(e) => {
                            onMinutesChange(e.target.value);
                        }}
                    />
                    <span className={styles["cooking-time-field__unit"]}>
                        {t("recipeForm.minutesUnit")}
                    </span>
                </div>
            </div>
            {!error && (
                <p className={styles["cooking-time-field__hint"]}>
                    {t("recipeForm.cookingTimeHint")}
                </p>
            )}
        </FormField>
    );
};
