const STORAGE_KEY = "cooking.expiredIngredientsNoticeShown";

// session-scoped, not persistent - the notice may reappear next login, just not again this tab session
export const hasShownExpiredIngredientsNotice = (): boolean =>
    sessionStorage.getItem(STORAGE_KEY) === "true";

export const markExpiredIngredientsNoticeShown = (): void => {
    sessionStorage.setItem(STORAGE_KEY, "true");
};
