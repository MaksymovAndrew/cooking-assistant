import { MINUTES_PER_HOUR } from "constants/time";

const MAX_HOURS = 99;

// Parses a "h:mm" or "hh:mm" form input to total minutes.
// Returns null when the format is invalid or values are out of range.
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

// Splits total minutes into whole hours and remaining minutes - the single source
// of the "/60" math that display formatters and components build their labels on.
export const splitCookingTime = (totalMinutes: number): CookingTimeParts => ({
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
});

export const formatCookingTimeInput = (totalMinutes: number): string => {
    const { hours, minutes } = splitCookingTime(totalMinutes);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
