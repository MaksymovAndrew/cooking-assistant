import { formatCountdown } from "utils/formatCountdown";

const MINUTE_MS = 60_000;

describe("formatCountdown", () => {
    it("should format a sub-minute duration as 0:ss", () => {
        expect(formatCountdown(5_000)).toBe("0:05");
    });

    it("should format a multi-minute duration as m:ss", () => {
        expect(formatCountdown(2 * MINUTE_MS + 9_000)).toBe("2:09");
    });

    it("should never go below 0:00", () => {
        expect(formatCountdown(-5_000)).toBe("0:00");
    });
});
