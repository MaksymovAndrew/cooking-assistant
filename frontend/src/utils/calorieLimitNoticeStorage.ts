const STORAGE_KEY = "cooking.calorieLimitNoticeShown";

// session-scoped, not persistent - the notice may reappear next login, just not again this tab session
export const hasShownCalorieLimitNotice = (): boolean =>
    sessionStorage.getItem(STORAGE_KEY) === "true";

export const markCalorieLimitNoticeShown = (): void => {
    sessionStorage.setItem(STORAGE_KEY, "true");
};
