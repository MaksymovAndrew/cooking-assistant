const STORAGE_KEY = "cooking.calorieLimitNoticeShownOn";

// scoped to (user, day) in one stored value, not just the day - otherwise a shared/kiosk browser
// where user A already triggered today's notice would silently suppress it for user B too
const storedValue = (userId: number, todayKey: string): string =>
    `${userId}:${todayKey}`;

// persistent (not sessionStorage) and keyed on the calendar day it fired, so it genuinely shows
// once per day - a closed tab, browser restart, or dev-server reload no longer resets it
export const hasShownCalorieLimitNotice = (
    userId: number,
    todayKey: string,
): boolean =>
    localStorage.getItem(STORAGE_KEY) === storedValue(userId, todayKey);

export const markCalorieLimitNoticeShown = (
    userId: number,
    todayKey: string,
): void => {
    localStorage.setItem(STORAGE_KEY, storedValue(userId, todayKey));
};
