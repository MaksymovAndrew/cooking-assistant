import { isRecordId } from "utils/recordIdParam";

describe("isRecordId", () => {
    it("should accept a positive integer id", () => {
        expect(isRecordId("1")).toBe(true);
        expect(isRecordId("4207")).toBe(true);
    });

    it("should reject anything the API would answer with a validation error", () => {
        expect(isRecordId("abc")).toBe(false);
        expect(isRecordId("0")).toBe(false);
        expect(isRecordId("-5")).toBe(false);
        expect(isRecordId("1.5")).toBe(false);
        expect(isRecordId("1/../../me")).toBe(false);
        expect(isRecordId("")).toBe(false);
    });
});
