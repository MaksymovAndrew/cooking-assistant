const STORAGE_KEY = "cooking.calorieLimitNoticeShownOn";

// per user too, or on a shared browser one user's notice would suppress another's
const storedValue = (userId: number, todayKey: string): string =>
    `${userId}:${todayKey}`;

// localStorage, not sessionStorage, so a closed tab or a restart can't show it twice in a day
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
