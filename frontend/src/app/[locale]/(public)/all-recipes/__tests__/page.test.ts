import { generateMetadata } from "app/[locale]/(public)/all-recipes/page";

const ALL_RECIPES = "/all-recipes";

const inLocale = (locale: string) => ({
    params: Promise.resolve({ locale }),
});

describe("all recipes page", () => {
    it("should point every filtered view at the one canonical list", async () => {
        const metadata = await generateMetadata(inLocale("en"));

        expect(metadata.title).toBe("All recipes");
        expect(metadata.alternates?.canonical).toBe(ALL_RECIPES);
        expect(metadata.description).not.toHaveLength(0);
    });

    it("should point each language at its own list and name the others", async () => {
        const metadata = await generateMetadata(inLocale("uk"));

        expect(metadata.alternates?.canonical).toBe("/uk/all-recipes");
        expect(metadata.alternates?.languages).toEqual({
            en: ALL_RECIPES,
            pl: "/pl/all-recipes",
            ru: "/ru/all-recipes",
            uk: "/uk/all-recipes",
            "x-default": ALL_RECIPES,
        });
    });
});
