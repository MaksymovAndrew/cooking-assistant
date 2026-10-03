import { DEFAULT_LOCALE } from "constants/locales";
import { requestLocale } from "i18n/requestLocale";

describe("requestLocale", () => {
    it("should fall back to the default language when nothing matches", () => {
        const acceptsLanguages = jest.fn().mockReturnValue(false);

        expect(requestLocale({ acceptsLanguages })).toBe(DEFAULT_LOCALE);
    });
});
