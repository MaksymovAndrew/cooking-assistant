import {
    hasShownCalorieLimitNotice,
    markCalorieLimitNoticeShown,
} from "utils/calorieLimitNoticeStorage";

const USER_ID = 7;
const TODAY = "2026-07-02";

describe("calorieLimitNoticeStorage", () => {
    it("should report the notice as not shown when nothing is stored", () => {
        expect(hasShownCalorieLimitNotice(USER_ID, TODAY)).toBe(false);
    });

    it("should report the notice as shown for the same user on the same day", () => {
        markCalorieLimitNoticeShown(USER_ID, TODAY);

        expect(hasShownCalorieLimitNotice(USER_ID, TODAY)).toBe(true);
    });

    it("should show the notice again on the next day", () => {
        markCalorieLimitNoticeShown(USER_ID, TODAY);

        expect(hasShownCalorieLimitNotice(USER_ID, "2026-07-03")).toBe(false);
    });

    it("should not suppress the notice for another user on a shared browser", () => {
        markCalorieLimitNoticeShown(USER_ID, TODAY);

        expect(hasShownCalorieLimitNotice(8, TODAY)).toBe(false);
    });
});
