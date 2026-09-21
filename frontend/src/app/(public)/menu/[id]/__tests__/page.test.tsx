import { notFound } from "next/navigation";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor } from "api/server";

import MenuDetailsPage, { generateMetadata } from "app/(public)/menu/[id]/page";
import { mockGetByUrl } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/server", () => ({ fetchAsVisitor: jest.fn() }));
jest.mock("api/client");

const mockedFetch = fetchAsVisitor as jest.MockedFunction<
    typeof fetchAsVisitor
>;

const TITLE = "Weekday menu";
const SAMPLE: MenuDetails = {
    menu: {
        id: 4,
        title: TITLE,
        categoryname: "Lunch",
        menucontent: "Quick and light.",
        category_id: 2,
        isOwner: false,
        photo_key: null,
        ...TEST_UNRATED,
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

        expect(metadata.title).toBe(TITLE);
        expect(metadata.description).toBe("Quick and light.");
        expect(metadata.alternates?.canonical).toBe("/menu/4");
    });

    it("should preview a menu with a cover photo as that photo", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            menu: {
                ...SAMPLE.menu,
                photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b",
            },
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.openGraph?.images).toEqual([
            expect.objectContaining({
                type: "image/jpeg",
                alt: TITLE,
            }),
        ]);
    });

    it("should put the menu on the page as a structured list of recipes", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);
        mockGetByUrl({ [API_ROUTES.userIngredients.list]: [] });

        const { container } = renderWithProviders(
            await MenuDetailsPage({ params }),
        );

        expect(JSON.parse(container.firstChild?.textContent ?? "")).toEqual(
            expect.objectContaining({
                "@type": "ItemList",
                name: TITLE,
            }),
        );
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

        await expect(MenuDetailsPage({ params })).rejects.toThrow();
        expect(notFound).toHaveBeenCalled();
    });
});
