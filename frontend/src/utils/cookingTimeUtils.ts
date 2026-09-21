import type { TFunction } from "i18next";

import { MINUTES_PER_HOUR } from "constants/time";

const MAX_HOURS = 99;

export const parseCookingTime = (value: string): number | null => {
    const parts = value.split(":");

    if (parts.length !== 2) {
        return null;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    const isInvalid =
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > MAX_HOURS ||
        minutes < 0 ||
        minutes >= MINUTES_PER_HOUR;

    if (isInvalid) {
        return null;
    }

    return hours * MINUTES_PER_HOUR + minutes;
};

export interface CookingTimeParts {
    hours: number;
    minutes: number;
}

// the single source of the "/60" math that display formatters and components build their labels on
export const splitCookingTime = (totalMinutes: number): CookingTimeParts => ({
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
});

export const formatCookingTimeInput = (totalMinutes: number): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

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

// the ISO 8601 form schema.org reads: 90 -> "PT1H30M", 45 -> "PT45M", 120 -> "PT2H"
export const isoDuration = (totalMinutes: number): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);
    const hoursPart = hours > 0 ? `${hours}H` : "";
    const minutesPart = minutes > 0 || hours === 0 ? `${minutes}M` : "";

    return `PT${hoursPart}${minutesPart}`;
};
