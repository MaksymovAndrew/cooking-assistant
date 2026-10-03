import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE, LOCALES } from "constants/locales";
import { VALIDATION_MESSAGES } from "constants/validationMessages";
import enErrors from "i18n/locales/en/errors.json";
import enMessages from "i18n/locales/en/messages.json";
import enValidation from "i18n/locales/en/validation.json";
import type { MessageKey } from "i18n/translate";
import {
    getEmailCopy,
    translateError,
    translateMessage,
    translateValidationIssues,
} from "i18n/translate";

const TRANSLATED_LOCALES = LOCALES.filter(
    (locale) => locale !== DEFAULT_LOCALE,
);
const MESSAGE_KEYS = Object.keys(enMessages).filter(
    (key): key is MessageKey => key in enMessages,
);

describe("translateError", () => {
    it.each(LOCALES)(
        "should have non-empty %s text for every error code",
        (locale) => {
            Object.values(ERROR_CODES).forEach((code) => {
                expect(translateError(code, locale)).not.toBe("");
            });
        },
    );

    it.each(TRANSLATED_LOCALES)(
        "should have %s error text that is not left in English",
        (locale) => {
            Object.values(ERROR_CODES).forEach((code) => {
                expect(translateError(code, locale)).not.toBe(
                    translateError(code, DEFAULT_LOCALE),
                );
            });
        },
    );

    it("should have no catalog entry without a matching error code", () => {
        expect(new Set(Object.keys(enErrors))).toEqual(
            new Set(Object.values(ERROR_CODES)),
        );
    });

    it("should return the text of the requested language", () => {
        expect(translateError(ERROR_CODES.RECIPE_NOT_FOUND, "uk")).toBe(
            "Рецепт не знайдено",
        );
    });
});

describe("translateMessage", () => {
    it("should return the catalog text for a success message key", () => {
        expect(translateMessage("loggedIn", DEFAULT_LOCALE)).toBe("Logged in");
    });

    it.each(TRANSLATED_LOCALES)(
        "should have %s message text that is not left in English",
        (locale) => {
            MESSAGE_KEYS.forEach((key) => {
                expect(translateMessage(key, locale)).not.toBe(
                    translateMessage(key, DEFAULT_LOCALE),
                );
            });
        },
    );
});

describe("getEmailCopy", () => {
    it.each(TRANSLATED_LOCALES)(
        "should write the %s email in its own language but keep the brand name",
        (locale) => {
            const copy = getEmailCopy(locale);
            const english = getEmailCopy(DEFAULT_LOCALE);

            expect(copy.brandName).toBe(english.brandName);
            expect(copy.passwordReset.body).not.toBe(
                english.passwordReset.body,
            );
            expect(copy.verification.footer).not.toBe(
                english.verification.footer,
            );
        },
    );
});

describe("translateValidationIssues", () => {
    const issue = (
        message: (typeof VALIDATION_MESSAGES)[keyof typeof VALIDATION_MESSAGES],
    ) => ({
        path: "",
        message,
        params: { min: 1, max: 2, values: "a, b" },
    });

    it("should have no catalog entry without a matching message key", () => {
        expect(new Set(Object.keys(enValidation))).toEqual(
            new Set(Object.values(VALIDATION_MESSAGES)),
        );
    });

    it.each(TRANSLATED_LOCALES)(
        "should have %s validation text that is not left in English",
        (locale) => {
            Object.values(VALIDATION_MESSAGES).forEach((message) => {
                expect(
                    translateValidationIssues([issue(message)], locale),
                ).not.toBe(
                    translateValidationIssues([issue(message)], DEFAULT_LOCALE),
                );
            });
        },
    );

    it.each(LOCALES)(
        "should fill every placeholder of the %s text",
        (locale) => {
            Object.values(VALIDATION_MESSAGES).forEach((message) => {
                expect(
                    translateValidationIssues([issue(message)], locale),
                ).not.toContain("{{");
            });
        },
    );

    it("should prefix each message with its field and join them", () => {
        expect(
            translateValidationIssues(
                [
                    { path: "title", message: "required", params: {} },
                    { path: "limit", message: "atMost", params: { max: 100 } },
                ],
                "uk",
            ),
        ).toBe("title: Обов'язкове поле; limit: Має бути не більше 100");
    });

    it("should leave a placeholder its issue has no value for as written", () => {
        expect(
            translateValidationIssues(
                [{ path: "", message: "atLeast", params: {} }],
                DEFAULT_LOCALE,
            ),
        ).toBe("Must be at least {{min}}");
    });
});
