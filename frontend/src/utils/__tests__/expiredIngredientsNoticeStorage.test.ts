import {
    hasShownExpiredIngredientsNotice,
    markExpiredIngredientsNoticeShown,
} from "utils/expiredIngredientsNoticeStorage";

describe("expiredIngredientsNoticeStorage", () => {
    it("should report the notice as not shown in a fresh session", () => {
        expect(hasShownExpiredIngredientsNotice()).toBe(false);
    });

    it("should report the notice as shown once marked", () => {
        markExpiredIngredientsNoticeShown();

        expect(hasShownExpiredIngredientsNotice()).toBe(true);
    });

    it("should keep the marker for the tab session only", () => {
        markExpiredIngredientsNoticeShown();

        expect(localStorage).toHaveLength(0);
        expect(sessionStorage).toHaveLength(1);
    });
});
