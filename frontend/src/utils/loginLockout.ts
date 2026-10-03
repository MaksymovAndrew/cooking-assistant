import {
    ATTEMPTS_PER_LOCK,
    FAILURE_RESET_IDLE_MINUTES,
    LOCKOUT_LADDER_MINUTES,
} from "constants/loginLockout";
import { MS_PER_MINUTE, MS_PER_SECOND } from "constants/time";

// re-exported so consumers import the whole lockout API from one place
export { ATTEMPTS_PER_LOCK, LOCKOUT_LADDER_MINUTES };

const LOGIN_STORAGE_KEY_PREFIX = "cooking.loginLockout";

// a distinct namespace so delete-account attempts never share a counter with login attempts
export const DELETE_ACCOUNT_STORAGE_KEY_PREFIX = "cooking.deleteAccountLockout";
const FAILURE_RESET_IDLE_MS = FAILURE_RESET_IDLE_MINUTES * MS_PER_MINUTE;

// per account, trimmed but never lowercased: logins are case-sensitive on the server
const storageKey = (
    login: string,
    prefix: string = LOGIN_STORAGE_KEY_PREFIX,
): string => `${prefix}.${login.trim()}`;

export interface LockoutState {
    failures: number;
    lockedUntil: number | null;
    lastFailureAt: number | null;
}

export const EMPTY_LOCKOUT: LockoutState = {
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

export const readLockout = (login: string, prefix?: string): LockoutState => {
    // a server render has no storage, so there is nothing to have been locked out from
    if (typeof window === "undefined") {
        return EMPTY_LOCKOUT;
    }

    const raw = localStorage.getItem(storageKey(login, prefix));

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

export const writeLockout = (
    state: LockoutState,
    login: string,
    prefix?: string,
): void => {
    localStorage.setItem(storageKey(login, prefix), JSON.stringify(state));
};

export const clearLockout = (login: string, prefix?: string): void => {
    localStorage.removeItem(storageKey(login, prefix));
};

// the ladder's top step repeats once it is reached
export const ladderStageMs = (failures: number): number =>
    LOCKOUT_LADDER_MINUTES[
        Math.min(
            Math.floor(failures / ATTEMPTS_PER_LOCK) - 1,
            LOCKOUT_LADDER_MINUTES.length - 1,
        )
    ] * MS_PER_MINUTE;

export const lockoutDurationMs = (state: LockoutState): number | null =>
    state.failures >= ATTEMPTS_PER_LOCK ? ladderStageMs(state.failures) : null;

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

    const lockedUntil = now + ladderStageMs(failures);

    return { failures, lockedUntil, lastFailureAt: now };
};

// whichever lock ends later wins: the server's Retry-After is authoritative
export const mergeServerRetryAfter = (
    state: LockoutState,
    seconds: number,
): LockoutState => {
    const serverLockedUntil = Date.now() + seconds * MS_PER_SECOND;
    const lockedUntil = Math.max(state.lockedUntil ?? 0, serverLockedUntil);

    return { ...state, lockedUntil };
};
