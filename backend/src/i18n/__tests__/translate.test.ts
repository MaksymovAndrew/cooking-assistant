import { ERROR_CODES } from "constants/errorCodes";
import enErrors from "i18n/locales/en/errors.json";
import { getEmailCopy, translateError, translateMessage } from "i18n/translate";

describe("translateError", () => {
    it("should have non-empty catalog text for every error code", () => {
        Object.values(ERROR_CODES).forEach((code) => {
            expect(translateError(code)).not.toBe("");
        });
    });

    it("should have no catalog entry without a matching error code", () => {
        expect(new Set(Object.keys(enErrors))).toEqual(
            new Set(Object.values(ERROR_CODES)),
        );
    });

    it("should return the catalog text for a code", () => {
        expect(translateError(ERROR_CODES.RECIPE_NOT_FOUND)).toBe(
            "Recipe not found",
        );
    });
});

describe("translateMessage", () => {
    it("should return the catalog text for a success message key", () => {
        expect(translateMessage("loggedIn")).toBe("Logged in");
    });
});

describe("getEmailCopy", () => {
    it("should return the email copy for the default locale", () => {
        expect(getEmailCopy().verification.subject).toBe("Verify your email");
    });
});
