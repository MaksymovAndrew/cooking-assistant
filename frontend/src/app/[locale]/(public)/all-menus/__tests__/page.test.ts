import { generateMetadata } from "app/[locale]/(public)/all-menus/page";

describe("all menus page", () => {
    it("should point every filtered view at the one canonical list", async () => {
        const metadata = await generateMetadata({
            params: Promise.resolve({ locale: "en" }),
        });

        expect(metadata.title).toBe("All menus");
        expect(metadata.alternates?.canonical).toBe("/all-menus");
        expect(metadata.description).not.toHaveLength(0);
    });
});
