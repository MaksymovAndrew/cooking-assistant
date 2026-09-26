import plCatalog from "i18n/locales/pl/catalog.json";
import { RESOURCES } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

const APP_NAME = "Cooking Assistant";

describe("getServerTranslation", () => {
    it("should translate keys from the default namespace", async () => {
        const t = await getServerTranslation("en");

        expect(t("appName")).toBe(APP_NAME);
    });

    it("should translate keys from an explicit namespace", async () => {
        const t = await getServerTranslation("en", "auth");

        expect(t("loginPage.heading")).toBe("Welcome back");
    });

    it("should translate in the language it is given", async () => {
        const t = await getServerTranslation("uk");

        expect(t("nav.recipes")).toBe("Рецепти");
    });

    it("should translate ingredient names without handing them to the page", async () => {
        const t = await getServerTranslation("pl");

        expect(t("catalog:ingredient.garlic")).toBe(
            plCatalog.ingredient.garlic,
        );
        expect(RESOURCES.pl.catalog).not.toHaveProperty("ingredient");
    });

    it("should not share state between instances", async () => {
        const common = await getServerTranslation("en");
        const auth = await getServerTranslation("en", "auth");

        expect(common("appName")).toBe(APP_NAME);
        expect(auth("loginPage.heading")).toBe("Welcome back");
    });
});
