import type { TFunction } from "i18next";

import {
    type DurationCopy,
    RECIPE_DURATION_COPY,
    STATS_DURATION_COPY,
} from "constants/durationCopy";
import { MINUTES_PER_HOUR } from "constants/time";

export interface CookingTimeParts {
    hours: number;
    minutes: number;
}

export const splitCookingTime = (totalMinutes: number): CookingTimeParts => ({
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
});

// a zero part is left out: 120 -> "2 hr", 45 -> "45 min"
export const formatDuration = (
    t: TFunction,
    totalMinutes: number,
    copy: DurationCopy,
): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);

    if (hours === 0) {
        return t(copy.minutes, { minutes });
    }

    return minutes === 0
        ? t(copy.hours, { hours })
        : t(copy.hoursMinutes, { hours, minutes });
};

// t is bound to the "recipes" namespace
export const formatRecipeDuration = (
    t: TFunction,
    totalMinutes: number,
): string => formatDuration(t, totalMinutes, RECIPE_DURATION_COPY);

// t is bound to the "stats" namespace
export const formatCompactDuration = (
    t: TFunction,
    totalMinutes: number,
): string => formatDuration(t, totalMinutes, STATS_DURATION_COPY);

// the ISO 8601 form schema.org reads: 90 -> "PT1H30M", 45 -> "PT45M", 120 -> "PT2H"
export const isoDuration = (totalMinutes: number): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);
    const hoursPart = hours > 0 ? `${hours}H` : "";
    const minutesPart = minutes > 0 || hours === 0 ? `${minutes}M` : "";

    return `PT${hoursPart}${minutesPart}`;
};
