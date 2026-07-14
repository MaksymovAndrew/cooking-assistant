import {
    isValidEmail,
    isValidLogin,
    isValidNamePart,
    isValidPassword,
} from "utils/authValidation";

describe("isValidNamePart", () => {
    it("should accept a capitalised name", () => {
        expect(isValidNamePart("Test")).toBe(true);
    });

    it("should reject a lowercase first letter", () => {
        expect(isValidNamePart("test")).toBe(false);
    });

    it("should reject a single letter", () => {
        expect(isValidNamePart("T")).toBe(false);
    });

    it("should reject a value containing digits", () => {
        expect(isValidNamePart("Test1")).toBe(false);
    });

    it("should reject an empty value", () => {
        expect(isValidNamePart("")).toBe(false);
    });

    it("should accept a value with a trailing space", () => {
        expect(isValidNamePart("Test ")).toBe(true);
    });

    it("should accept a value with a leading space", () => {
        expect(isValidNamePart(" Test")).toBe(true);
    });
});

describe("isValidLogin", () => {
    it("should accept two or more characters", () => {
        expect(isValidLogin("ab")).toBe(true);
    });

    it("should reject a single character", () => {
        expect(isValidLogin("a")).toBe(false);
    });

    it("should reject a value that is only whitespace", () => {
        expect(isValidLogin("  ")).toBe(false);
    });
});

describe("isValidEmail", () => {
    it("should accept a well-formed email", () => {
        expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject a value without an @", () => {
        expect(isValidEmail("test.example.com")).toBe(false);
    });

    it("should reject a value without a domain", () => {
        expect(isValidEmail("test@")).toBe(false);
    });

    it("should accept a value with surrounding whitespace", () => {
        expect(isValidEmail(" test@example.com ")).toBe(true);
    });

    it("should reject an empty value", () => {
        expect(isValidEmail("")).toBe(false);
    });
});

describe("isValidPassword", () => {
    it("should accept a password with 8+ characters, a letter, a number, and a special character", () => {
        expect(isValidPassword("secret1!")).toBe(true);
    });

    it("should reject fewer than eight characters", () => {
        expect(isValidPassword("sec1!")).toBe(false);
    });

    it("should reject a password with no letter", () => {
        expect(isValidPassword("12345678!")).toBe(false);
    });

    it("should reject a password with no number", () => {
        expect(isValidPassword("secretpass!")).toBe(false);
    });

    it("should reject a password with no special character", () => {
        expect(isValidPassword("secretpass1")).toBe(false);
    });
});
