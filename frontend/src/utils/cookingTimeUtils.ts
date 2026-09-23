import type { TFunction } from "i18next";

import { MINUTES_PER_HOUR } from "constants/time";

export interface CookingTimeParts {
    hours: number;
    minutes: number;
}

// the single source of the "/60" math that display formatters and components build their labels on
export const splitCookingTime = (totalMinutes: number): CookingTimeParts => ({
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
});

// t is bound to the "recipes" namespace
export const formatRecipeDuration = (
    t: TFunction,
    totalMinutes: number,
): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);

    return hours > 0
        ? t("recipeDetailsPage.cookingTimeHoursMinutes", { hours, minutes })
        : t("recipeDetailsPage.cookingTimeMinutes", { minutes });
};

// t is bound to the "stats" namespace: "1h 30m", or "45 min" under an hour
export const formatCompactDuration = (
    t: TFunction,
    totalMinutes: number,
): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);

    return hours > 0
        ? t("statsPage.timeCompactHoursMinutes", { hours, minutes })
        : t("statsPage.timeMinutesOnly", { minutes });
};

// the ISO 8601 form schema.org reads: 90 -> "PT1H30M", 45 -> "PT45M", 120 -> "PT2H"
export const isoDuration = (totalMinutes: number): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);
    const hoursPart = hours > 0 ? `${hours}H` : "";
    const minutesPart = minutes > 0 || hours === 0 ? `${minutes}M` : "";

    return `PT${hoursPart}${minutesPart}`;
};
