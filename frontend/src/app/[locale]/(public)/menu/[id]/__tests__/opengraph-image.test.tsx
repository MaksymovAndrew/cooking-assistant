import { render, screen } from "@testing-library/react";
import { ImageResponse } from "next/og";

import type { MenuDetails } from "types/menu";

import { fetchPublic } from "api/server";

import MenuSocialImage, {
    generateImageMetadata,
} from "app/[locale]/(public)/menu/[id]/opengraph-image";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

jest.mock("api/server", () => ({ fetchPublic: jest.fn() }));
jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));

const mockedFetch = fetchPublic as jest.MockedFunction<typeof fetchPublic>;

const SAMPLE: MenuDetails = {
    menu: {
        id: 4,
        title: "Weekday menu",
        language: "en",
        categoryname: "Lunch",
        menucontent: "Quick and light.",
        category_id: 2,
        isOwner: false,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: null,
    },
    recipes: [
        {
            recipe_id: 9,
            title: "Borscht",
            language: "en",
            type_name: "Soup",
            cooking_time: 30,
            creation_date: "2024-01-01",
            calories_per_portion: null,
            photo_key: null,
            ratingAverage: null,
            ratingCount: 0,
        },
    ],
    allergens: [],
};

const params = Promise.resolve({ locale: "en", id: "4" });

describe("menu preview image", () => {
    it("should declare one card with its size and type", async () => {
        const [entry] = await generateImageMetadata({
            params: { locale: "en" },
        });

        expect(entry).toEqual(
            expect.objectContaining({
                size: { width: 1200, height: 630 },
                contentType: "image/png",
            }),
        );
    });

    it("should show the menu with its category, author and recipe count", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);

        await MenuSocialImage({ params });
        const [card] = jest.mocked(ImageResponse).mock.calls[0];

        render(card);

        expect(screen.getByText("Lunch")).toBeInTheDocument();
        expect(screen.getByText("Weekday menu")).toBeInTheDocument();
        expect(screen.getByText("by Test U.")).toBeInTheDocument();
        expect(screen.getByText("1 recipe")).toBeInTheDocument();
        expect(screen.queryByText(/Rated/)).not.toBeInTheDocument();
    });

    it("should answer 404 for a menu that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        const response = await MenuSocialImage({ params });

        expect(response.status).toBe(404);
    });
});
