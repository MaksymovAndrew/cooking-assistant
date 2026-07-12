import {
    ATTEMPTS_PER_LOCK,
    LOCKOUT_LADDER_MINUTES,
} from "constants/loginLockout";
import {
    MS_PER_MINUTE,
    MS_PER_SECOND,
    SECONDS_PER_MINUTE,
} from "constants/time";

// the ladder values live in constants/loginLockout.ts; re-exported so form/hook consumers keep one import site for the whole lockout API
export { ATTEMPTS_PER_LOCK, LOCKOUT_LADDER_MINUTES };

const STORAGE_KEY = "cooking.loginLockout";

export interface LockoutState {
    failures: number;
    lockedUntil: number | null;
}

const EMPTY_LOCKOUT: LockoutState = { failures: 0, lockedUntil: null };

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isLockoutState = (value: unknown): value is LockoutState =>
    isObject(value) &&
    typeof value.failures === "number" &&
    (value.lockedUntil === null || typeof value.lockedUntil === "number");

export const readLockout = (): LockoutState => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return EMPTY_LOCKOUT;
    }

    try {
        const parsed: unknown = JSON.parse(raw);

        return isLockoutState(parsed) ? parsed : EMPTY_LOCKOUT;
    } catch {
        // storage left over from an earlier app version - start clean
        return EMPTY_LOCKOUT;
    }
};

export const writeLockout = (state: LockoutState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearLockout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

// a failed (non-429) login attempt: bump the counter, and lock once it hits the next multiple of ATTEMPTS_PER_LOCK, climbing one ladder step per lock
export const registerFailure = (state: LockoutState): LockoutState => {
    const failures = state.failures + 1;

    if (failures % ATTEMPTS_PER_LOCK !== 0) {
        return { failures, lockedUntil: state.lockedUntil };
    }

    const stageIndex = Math.min(
        failures / ATTEMPTS_PER_LOCK - 1,
        LOCKOUT_LADDER_MINUTES.length - 1,
    );
    const lockedUntil =
        Date.now() + LOCKOUT_LADDER_MINUTES[stageIndex] * MS_PER_MINUTE;

    return { failures, lockedUntil };
};

// the server's 429 Retry-After is authoritative for duration: take whichever lockout (client ladder or server cool-down) ends later
export const mergeServerRetryAfter = (
    state: LockoutState,
    seconds: number,
): LockoutState => {
    const serverLockedUntil = Date.now() + seconds * MS_PER_SECOND;
    const lockedUntil = Math.max(state.lockedUntil ?? 0, serverLockedUntil);

    return { ...state, lockedUntil };
};

export const formatCountdown = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / MS_PER_SECOND));
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
