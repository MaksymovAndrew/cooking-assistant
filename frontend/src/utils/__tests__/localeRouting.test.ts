import { negotiateLocale, resolveLocaleRoute } from "utils/localeRouting";

const RECIPE_PATH = "/recipe/7";
const EN_RECIPE_PATH = `/en${RECIPE_PATH}`;

const request = (
    pathname: string,
    overrides: Partial<Parameters<typeof resolveLocaleRoute>[0]> = {},
) => ({
    pathname,
    cookieLocale: null,
    acceptLanguage: null,
    isBot: false,
    ...overrides,
});

describe("negotiateLocale", () => {
    it("should pick the most preferred language the app has", () => {
        expect(negotiateLocale("de-DE,de;q=0.9,uk;q=0.8,ru;q=0.7")).toBe("uk");
    });

    it("should rank by quality rather than by order", () => {
        expect(negotiateLocale("en;q=0.5,pl-PL")).toBe("pl");
    });

    it("should skip a language the browser refuses", () => {
        expect(negotiateLocale("ru;q=0,en;q=0.4")).toBe("en");
    });

    it("should find nothing when the browser asks for nothing the app has", () => {
        expect(negotiateLocale("de,fr;q=0.8")).toBeNull();
        expect(negotiateLocale(null)).toBeNull();
    });
});

describe("resolveLocaleRoute", () => {
    it("should serve a prefixed path as it is", () => {
        expect(resolveLocaleRoute(request("/ru/recipe/7"))).toEqual({
            kind: "pass",
        });
    });

    it("should move the default language's prefix to the bare path for good", () => {
        expect(resolveLocaleRoute(request(EN_RECIPE_PATH))).toEqual({
            kind: "redirect",
            pathname: RECIPE_PATH,
            permanent: true,
        });
    });

    it("should serve a generated image under the default language's prefix", () => {
        expect(
            resolveLocaleRoute(request("/en/recipe/7/opengraph-image-card")),
        ).toEqual({ kind: "pass" });
    });

    it("should serve a bare path in the default language when nothing asks otherwise", () => {
        expect(resolveLocaleRoute(request(RECIPE_PATH))).toEqual({
            kind: "rewrite",
            pathname: EN_RECIPE_PATH,
        });
        expect(resolveLocaleRoute(request("/"))).toEqual({
            kind: "rewrite",
            pathname: "/en",
        });
    });

    it("should send a visitor to the language their browser prefers", () => {
        expect(
            resolveLocaleRoute(request(RECIPE_PATH, { acceptLanguage: "pl" })),
        ).toEqual({
            kind: "redirect",
            pathname: "/pl/recipe/7",
            permanent: false,
        });
    });

    it("should let a chosen language win over the browser's", () => {
        expect(
            resolveLocaleRoute(
                request("/", { cookieLocale: "uk", acceptLanguage: "ru" }),
            ),
        ).toEqual({ kind: "redirect", pathname: "/uk", permanent: false });
        expect(
            resolveLocaleRoute(
                request("/", { cookieLocale: "en", acceptLanguage: "ru" }),
            ),
        ).toEqual({ kind: "rewrite", pathname: "/en" });
    });

    it("should ignore a remembered language the app does not have", () => {
        expect(
            resolveLocaleRoute(
                request("/", { cookieLocale: "de", acceptLanguage: "ru" }),
            ),
        ).toEqual({ kind: "redirect", pathname: "/ru", permanent: false });
    });

    it("should never redirect a crawler", () => {
        expect(
            resolveLocaleRoute(
                request(RECIPE_PATH, {
                    isBot: true,
                    cookieLocale: "uk",
                    acceptLanguage: "ru",
                }),
            ),
        ).toEqual({ kind: "rewrite", pathname: EN_RECIPE_PATH });
    });
});
