import { formatDate, formatNumber } from "utils/intlFormat";

const DATE = "2026-07-02T10:00:00Z";
const UTC_DAY: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
};

describe("formatDate", () => {
    it("should format a Date and its ISO string the same way", () => {
        expect(formatDate(new Date(DATE), "en", UTC_DAY)).toBe("July 2");
        expect(formatDate(DATE, "en", UTC_DAY)).toBe("July 2");
    });

    it("should not reuse a formatter across languages", () => {
        expect(formatDate(DATE, "en", UTC_DAY)).toBe("July 2");
        expect(formatDate(DATE, "uk", UTC_DAY)).not.toBe("July 2");
    });

    it("should not reuse a formatter across options", () => {
        expect(formatDate(DATE, "en", UTC_DAY)).toBe("July 2");
        expect(
            formatDate(DATE, "en", { year: "numeric", timeZone: "UTC" }),
        ).toBe("2026");
    });

    it("should build a formatter only once for the same language and options", () => {
        const spy = jest.spyOn(Intl, "DateTimeFormat");
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            timeZone: "UTC",
        };

        formatDate("2026-07-02", "pl", options);
        formatDate("2026-07-03", "pl", options);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});

describe("formatNumber", () => {
    it("should group thousands the way the language does", () => {
        expect(formatNumber(1234.5, "en")).toBe("1,234.5");
    });

    it("should apply the given options", () => {
        expect(formatNumber(2, "en", { minimumFractionDigits: 2 })).toBe(
            "2.00",
        );
    });

    it("should build a formatter only once for the same language and options", () => {
        const spy = jest.spyOn(Intl, "NumberFormat");
        const options: Intl.NumberFormatOptions = { maximumFractionDigits: 3 };

        formatNumber(1, "ru", options);
        formatNumber(2, "ru", options);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
