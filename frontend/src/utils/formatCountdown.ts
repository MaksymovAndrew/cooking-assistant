import { MS_PER_SECOND, SECONDS_PER_MINUTE } from "constants/time";

// "2:09" - minutes and zero-padded seconds, never negative
export const formatCountdown = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / MS_PER_SECOND));
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
