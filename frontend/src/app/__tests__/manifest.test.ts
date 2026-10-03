import manifest from "app/manifest";

describe("manifest", () => {
    it("should install as a standalone app that opens at the home page", async () => {
        const result = await manifest();

        expect(result.name).toBe("Cooking Assistant");
        expect(result.display).toBe("standalone");
        expect(result.start_url).toBe("/");
        expect(result.theme_color).toBe(process.env.THEME_COLOR_DARK);
    });

    it("should offer each generated icon size for any shape and for a cropped one", async () => {
        const { icons = [] } = await manifest();

        expect(
            icons.map(({ src, purpose }) => `${src} ${String(purpose)}`),
        ).toEqual([
            "/icon/192 any",
            "/icon/192 maskable",
            "/icon/512 any",
            "/icon/512 maskable",
        ]);
        expect(icons[0]).toEqual(
            expect.objectContaining({ sizes: "192x192", type: "image/png" }),
        );
    });
});
