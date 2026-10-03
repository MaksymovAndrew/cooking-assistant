const STORAGE_KEY = "cooking.expiredIngredientsNoticeShown";

// sessionStorage: the notice may return next session, just not again in this tab
export const hasShownExpiredIngredientsNotice = (): boolean =>
    sessionStorage.getItem(STORAGE_KEY) === "true";

export const markExpiredIngredientsNoticeShown = (): void => {
    sessionStorage.setItem(STORAGE_KEY, "true");
};
