import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE, LOCALES } from "constants/locales";
import enErrors from "i18n/locales/en/errors.json";
import enMessages from "i18n/locales/en/messages.json";
import type { MessageKey } from "i18n/translate";
import { getEmailCopy, translateError, translateMessage } from "i18n/translate";

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

    it("should return the catalog text for a code", () => {
        expect(
            translateError(ERROR_CODES.RECIPE_NOT_FOUND, DEFAULT_LOCALE),
        ).toBe("Recipe not found");
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
    it("should return the email copy for the default locale", () => {
        expect(getEmailCopy(DEFAULT_LOCALE).verification.subject).toBe(
            "Verify your email",
        );
    });

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
