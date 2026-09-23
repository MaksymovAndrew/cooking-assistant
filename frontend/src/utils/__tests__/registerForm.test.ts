import i18next from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

import {
    EMPTY_REGISTER_FORM,
    hasEmptyRegisterField,
    registerErrorMessage,
    registerFieldErrors,
    trimmedRegistration,
} from "utils/registerForm";

const t = i18next.getFixedT(null, "auth");

const VALID = {
    name: "Ada",
    surname: "Cook",
    login: "adacook",
    email: "ada@example.com",
    password: "long-enough-1",
};

describe("hasEmptyRegisterField", () => {
    it("should flag a form with any empty field", () => {
        expect(hasEmptyRegisterField({ ...VALID, email: "" })).toBe(true);
    });

    it("should pass a fully filled form", () => {
        expect(hasEmptyRegisterField(VALID)).toBe(false);
    });

    it("should flag the untouched form", () => {
        expect(hasEmptyRegisterField(EMPTY_REGISTER_FORM)).toBe(true);
    });
});

describe("registerFieldErrors", () => {
    it("should report nothing for valid values", () => {
        expect(registerFieldErrors(VALID, t)).toEqual({});
    });

    it("should report only the field that fails", () => {
        expect(
            Object.keys(registerFieldErrors({ ...VALID, email: "nope" }, t)),
        ).toEqual(["email"]);
    });
});

describe("trimmedRegistration", () => {
    it("should trim every field but the password", () => {
        expect(
            trimmedRegistration({ ...VALID, name: " Ada ", password: " pw " }),
        ).toEqual({ ...VALID, name: "Ada", password: " pw " });
    });
});

describe("registerErrorMessage", () => {
    it("should name a taken email", () => {
        expect(
            registerErrorMessage(
                {
                    status: 409,
                    data: "taken",
                    code: ERROR_CODES.EMAIL_ALREADY_TAKEN,
                },
                t,
            ),
        ).toBe(t("errors.emailAlreadyTaken"));
    });

    it("should treat any other conflict as a taken login", () => {
        expect(registerErrorMessage({ status: 409, data: "taken" }, t)).toBe(
            t("errors.userExists"),
        );
    });

    it("should fall back to a generic failure", () => {
        expect(registerErrorMessage({ status: 400, data: "bad" }, t)).toBe(
            t("errors.registrationFailed"),
        );
    });
});
