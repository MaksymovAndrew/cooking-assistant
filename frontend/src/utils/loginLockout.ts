import {
    ATTEMPTS_PER_LOCK,
    FAILURE_RESET_IDLE_MINUTES,
    LOCKOUT_LADDER_MINUTES,
} from "constants/loginLockout";
import {
    MS_PER_MINUTE,
    MS_PER_SECOND,
    SECONDS_PER_MINUTE,
} from "constants/time";

// the ladder values live in constants/loginLockout.ts; re-exported so form/hook consumers keep one import site for the whole lockout API
export { ATTEMPTS_PER_LOCK, LOCKOUT_LADDER_MINUTES };

const STORAGE_KEY_PREFIX = "cooking.loginLockout";
const FAILURE_RESET_IDLE_MS = FAILURE_RESET_IDLE_MINUTES * MS_PER_MINUTE;

// scoped per identifier (trimmed only - never lowercased, since login lookups are case-sensitive server-side) so a shared/kiosk browser can't cross-lock unrelated accounts
const storageKey = (login: string): string =>
    `${STORAGE_KEY_PREFIX}.${login.trim()}`;

export interface LockoutState {
    failures: number;
    lockedUntil: number | null;
    lastFailureAt: number | null;
}

const EMPTY_LOCKOUT: LockoutState = {
    failures: 0,
    lockedUntil: null,
    lastFailureAt: null,
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isLockoutState = (value: unknown): value is LockoutState =>
    isObject(value) &&
    typeof value.failures === "number" &&
    (value.lockedUntil === null || typeof value.lockedUntil === "number") &&
    (value.lastFailureAt === null || typeof value.lastFailureAt === "number");

export const readLockout = (login: string): LockoutState => {
    const raw = localStorage.getItem(storageKey(login));

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

export const writeLockout = (state: LockoutState, login: string): void => {
    localStorage.setItem(storageKey(login), JSON.stringify(state));
};

export const clearLockout = (login: string): void => {
    localStorage.removeItem(storageKey(login));
};

// bumps the counter and locks once it hits the next ATTEMPTS_PER_LOCK multiple; a stale-enough streak resets first
export const registerFailure = (state: LockoutState): LockoutState => {
    const now = Date.now();
    const isStreakStale =
        state.lastFailureAt !== null &&
        now - state.lastFailureAt > FAILURE_RESET_IDLE_MS;
    const previousFailures = isStreakStale ? 0 : state.failures;
    const previousLockedUntil = isStreakStale ? null : state.lockedUntil;
    const failures = previousFailures + 1;

    if (failures % ATTEMPTS_PER_LOCK !== 0) {
        return {
            failures,
            lockedUntil: previousLockedUntil,
            lastFailureAt: now,
        };
    }

    const stageIndex = Math.min(
        failures / ATTEMPTS_PER_LOCK - 1,
        LOCKOUT_LADDER_MINUTES.length - 1,
    );
    const lockedUntil =
        now + LOCKOUT_LADDER_MINUTES[stageIndex] * MS_PER_MINUTE;

    return { failures, lockedUntil, lastFailureAt: now };
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
