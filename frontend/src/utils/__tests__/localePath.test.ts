import {
    localeOfPath,
    localizePath,
    splitLocale,
    stripLocale,
    switchLocaleHref,
} from "utils/localePath";

const RECIPE_PATH = "/recipe/7";
const ALL_RECIPES = "/all-recipes";

describe("localizePath", () => {
    it("should keep the bare path for the default language", () => {
        expect(localizePath(RECIPE_PATH, "en")).toBe(RECIPE_PATH);
    });

    it("should prefix the path with any other language", () => {
        expect(localizePath(RECIPE_PATH, "uk")).toBe("/uk/recipe/7");
    });

    it("should prefix the root without a trailing slash", () => {
        expect(localizePath("/", "pl")).toBe("/pl");
        expect(localizePath("/?tab=news", "pl")).toBe("/pl?tab=news");
    });

    it("should keep the query string after the prefix", () => {
        expect(localizePath("/profile?tab=dietary", "ru")).toBe(
            "/ru/profile?tab=dietary",
        );
    });

    it("should leave a path that already names its language alone", () => {
        expect(localizePath("/ru/recipe/7", "pl")).toBe("/ru/recipe/7");
    });

    it("should leave anything that is not a path in this app alone", () => {
        expect(localizePath("//example.com/x", "ru")).toBe("//example.com/x");
        expect(localizePath("https://example.com", "ru")).toBe(
            "https://example.com",
        );
    });
});

describe("splitLocale", () => {
    it("should separate the language from the route", () => {
        expect(splitLocale("/uk/recipe/7")).toEqual({
            locale: "uk",
            path: RECIPE_PATH,
        });
    });

    it("should read a bare language prefix as the root", () => {
        expect(splitLocale("/ru")).toEqual({ locale: "ru", path: "/" });
        expect(splitLocale("/ru?page=2")).toEqual({
            locale: "ru",
            path: "/?page=2",
        });
    });

    it("should find no language in an unprefixed path", () => {
        expect(splitLocale(RECIPE_PATH)).toEqual({
            locale: null,
            path: RECIPE_PATH,
        });
    });
});

describe("stripLocale", () => {
    it("should give the same route for every language", () => {
        expect(stripLocale(`/pl${ALL_RECIPES}`)).toBe(ALL_RECIPES);
        expect(stripLocale(ALL_RECIPES)).toBe(ALL_RECIPES);
    });
});

describe("localeOfPath", () => {
    it("should read the language of a prefixed path", () => {
        expect(localeOfPath("/uk/login")).toBe("uk");
    });

    it("should read an unprefixed path as the default language", () => {
        expect(localeOfPath("/login")).toBe("en");
    });
});

describe("switchLocaleHref", () => {
    it("should move the same page into another language", () => {
        expect(
            switchLocaleHref(
                { pathname: "/ru/all-recipes", search: "?q=soup", hash: "" },
                "uk",
            ),
        ).toBe("/uk/all-recipes?q=soup");
    });

    it("should drop the prefix when switching to the default language", () => {
        expect(
            switchLocaleHref(
                { pathname: "/pl/recipe/7", search: "", hash: "#steps" },
                "en",
            ),
        ).toBe("/recipe/7#steps");
    });

    it("should prefix a bare English path", () => {
        expect(
            switchLocaleHref({ pathname: "/", search: "", hash: "" }, "ru"),
        ).toBe("/ru");
    });
});
