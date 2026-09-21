import { notFound } from "next/navigation";

import type { MenuDetails } from "types/menu";

import { fetchAsVisitor } from "api/server";

import MenuDetailsPage, { generateMetadata } from "app/(public)/menu/[id]/page";
import { TEST_AUTHOR } from "test/constants";

jest.mock("api/server", () => ({ fetchAsVisitor: jest.fn() }));

const mockedFetch = fetchAsVisitor as jest.MockedFunction<
    typeof fetchAsVisitor
>;

const SAMPLE: MenuDetails = {
    menu: {
        id: 4,
        title: "Weekday menu",
        categoryname: "Lunch",
        menucontent: "Quick and light.",
        category_id: 2,
        isOwner: false,
        photo_key: null,
        author: TEST_AUTHOR,
        isFavourite: false,
    },
    recipes: [],
    allergens: [],
};

const params = Promise.resolve({ id: "4" });

describe("menu details page", () => {
    it("should describe the menu it renders, not the app", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);

        const metadata = await generateMetadata({ params });

        expect(metadata.title).toBe("Weekday menu");
        expect(metadata.description).toBe("Quick and light.");
        expect(metadata.alternates?.canonical).toBe("/menu/4");
    });

    it("should describe a menu with no description from what it does know", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            menu: { ...SAMPLE.menu, menucontent: "" },
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.description).toBe("A lunch menu built from 0 recipes.");
    });

    it("should describe a menu with no category without naming one", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            menu: { ...SAMPLE.menu, menucontent: "", categoryname: null },
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.description).toBe("A menu built from 0 recipes.");
    });

    it("should answer 404 for a menu that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        await MenuDetailsPage({ params });

        expect(notFound).toHaveBeenCalled();
    });
});
