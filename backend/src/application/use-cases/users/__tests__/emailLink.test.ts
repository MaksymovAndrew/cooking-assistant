import { DEFAULT_LOCALE } from "constants/locales";

import { emailLink } from "application/use-cases/users/emailLink";

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

describe("emailLink", () => {
    it("should link to the unprefixed page for the default language", () => {
        expect(
            emailLink(
                TEST_FRONTEND_ORIGIN,
                "/reset-password",
                "abc",
                DEFAULT_LOCALE,
            ),
        ).toBe(`${TEST_FRONTEND_ORIGIN}/reset-password?token=abc`);
    });

    it("should link to the page in the account's language", () => {
        expect(
            emailLink(TEST_FRONTEND_ORIGIN, "/verify-email", "abc", "uk"),
        ).toBe(`${TEST_FRONTEND_ORIGIN}/uk/verify-email?token=abc`);
    });
});
