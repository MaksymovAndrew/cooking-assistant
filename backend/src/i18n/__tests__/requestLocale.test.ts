import { DEFAULT_LOCALE, LOCALES } from "constants/locales";
import { requestLocale } from "i18n/requestLocale";

describe("requestLocale", () => {
    it("should offer every supported language and take the best match", () => {
        const acceptsLanguages = jest.fn().mockReturnValue(DEFAULT_LOCALE);

        expect(requestLocale({ acceptsLanguages })).toBe(DEFAULT_LOCALE);
        expect(acceptsLanguages).toHaveBeenCalledWith(...LOCALES);
    });

    it("should fall back to the default language when nothing matches", () => {
        const acceptsLanguages = jest.fn().mockReturnValue(false);

        expect(requestLocale({ acceptsLanguages })).toBe(DEFAULT_LOCALE);
    });
});
