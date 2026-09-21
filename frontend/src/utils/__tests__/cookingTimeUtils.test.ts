import {
    formatCookingTimeInput,
    isoDuration,
    parseCookingTime,
    splitCookingTime,
} from "utils/cookingTimeUtils";

describe("parseCookingTime", () => {
    it("should parse valid h:mm string to minutes", () => {
        expect(parseCookingTime("1:30")).toBe(90);
    });

    it("should parse valid 0:mm string to minutes", () => {
        expect(parseCookingTime("0:10")).toBe(10);
    });

    it("should parse zero cooking time", () => {
        expect(parseCookingTime("0:00")).toBe(0);
    });

    it("should return null when separator is missing", () => {
        expect(parseCookingTime("130")).toBeNull();
    });

    it("should return null when minutes are 60 or more", () => {
        expect(parseCookingTime("1:60")).toBeNull();
    });

    it("should return null when hours exceed 99", () => {
        expect(parseCookingTime("100:00")).toBeNull();
    });

    it("should return null for non-numeric parts", () => {
        expect(parseCookingTime("a:30")).toBeNull();
    });
});

describe("formatCookingTimeInput", () => {
    it("should format minutes to hh:mm string", () => {
        expect(formatCookingTimeInput(90)).toBe("01:30");
    });

    it("should pad single-digit minutes", () => {
        expect(formatCookingTimeInput(10)).toBe("00:10");
    });

    it("should handle zero", () => {
        expect(formatCookingTimeInput(0)).toBe("00:00");
    });

    it("should handle hours over 9", () => {
        expect(formatCookingTimeInput(660)).toBe("11:00");
    });
});

describe("splitCookingTime", () => {
    it("should split minutes into whole hours and remaining minutes", () => {
        expect(splitCookingTime(90)).toEqual({ hours: 1, minutes: 30 });
    });

    it("should return zero hours when under an hour", () => {
        expect(splitCookingTime(45)).toEqual({ hours: 0, minutes: 45 });
    });

    it("should return zero minutes on a whole hour", () => {
        expect(splitCookingTime(120)).toEqual({ hours: 2, minutes: 0 });
    });

    it("should handle zero", () => {
        expect(splitCookingTime(0)).toEqual({ hours: 0, minutes: 0 });
    });
});

describe("isoDuration", () => {
    it("should write hours and minutes the way schema.org reads them", () => {
        expect(isoDuration(90)).toBe("PT1H30M");
    });

    it("should leave out the hours under an hour", () => {
        expect(isoDuration(45)).toBe("PT45M");
    });

    it("should leave out the minutes on a whole hour", () => {
        expect(isoDuration(120)).toBe("PT2H");
    });

    it("should still name a unit for zero", () => {
        expect(isoDuration(0)).toBe("PT0M");
    });
});
