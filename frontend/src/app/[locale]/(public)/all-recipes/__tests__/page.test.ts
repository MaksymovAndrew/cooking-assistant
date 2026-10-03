import { generateMetadata } from "app/[locale]/(public)/all-recipes/page";

describe("all recipes page", () => {
    it("should point every filtered view at the one canonical list", async () => {
        const metadata = await generateMetadata({
            params: Promise.resolve({ locale: "en" }),
        });

        expect(metadata.title).toBe("All recipes");
        expect(metadata.alternates?.canonical).toBe("/all-recipes");
        expect(metadata.description).not.toHaveLength(0);
    });
});
