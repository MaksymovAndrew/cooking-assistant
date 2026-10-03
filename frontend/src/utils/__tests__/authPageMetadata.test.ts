import { ROUTES } from "constants/routes";

import { authPageMetadata } from "utils/authPageMetadata";

const inLocale = (locale: string) => ({
    params: Promise.resolve({ locale }),
});

const loginMetadata = authPageMetadata({
    path: ROUTES.login,
    titleKey: "loginPage.heading",
    descriptionKey: "loginPage.taglineDescription",
});

const resetPasswordMetadata = authPageMetadata({
    path: ROUTES.resetPassword,
    titleKey: "resetPasswordPage.heading",
    descriptionKey: "resetPasswordPage.taglineDescription",
});

describe("authPageMetadata", () => {
    it("should title and describe the page in its own language", async () => {
        const metadata = await loginMetadata(inLocale("en"));

        expect(metadata.title).toBe("Welcome back");
        expect(metadata.description).toContain("Organise recipes");
    });

    it("should point each language at its own page and name the others", async () => {
        const metadata = await loginMetadata(inLocale("pl"));

        expect(metadata.alternates?.canonical).toBe("/pl/login");
        expect(metadata.alternates?.languages).toEqual({
            en: "/login",
            pl: "/pl/login",
            ru: "/ru/login",
            uk: "/uk/login",
            "x-default": "/login",
        });
        expect(metadata.openGraph?.url).toBe("/pl/login");
    });

    it("should leave a sign-in page open to indexing", async () => {
        const metadata = await loginMetadata(inLocale("en"));

        expect(metadata.robots).toBeUndefined();
    });

    it("should keep a page reached through an emailed link out of the index", async () => {
        const metadata = await resetPasswordMetadata(inLocale("uk"));

        expect(metadata.robots).toEqual({ index: false, follow: false });
        expect(metadata.alternates?.canonical).toBe("/uk/reset-password");
    });
});
