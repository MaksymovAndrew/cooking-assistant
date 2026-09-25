import { render, screen } from "@testing-library/react";
import { ImageResponse } from "next/og";

import type { RecipeDetails } from "types/recipe";

import { fetchPublic } from "api/server";

import RecipeSocialImage, {
    generateImageMetadata,
} from "app/[locale]/(public)/recipe/[id]/opengraph-image";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

jest.mock("api/server", () => ({ fetchPublic: jest.fn() }));
jest.mock("next/og", () => ({ ImageResponse: jest.fn() }));

const mockedFetch = fetchPublic as jest.MockedFunction<typeof fetchPublic>;

const SAMPLE: RecipeDetails = {
    id: 7,
    title: "Borscht",
    content: "Boil the beetroot.",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 135,
    creation_date: "2024-01-01",
    isOwner: false,
    photo_key: null,
    ratingAverage: 4.5,
    ratingCount: 2,
    myRating: null,
    author: TEST_AUTHOR,
    isFavourite: null,
    containsAvoided: null,
    tags: null,
    calories_per_portion: 320,
    calories_override: null,
};

const params = Promise.resolve({ locale: "en", id: "7" });

const renderCard = () => {
    const [card] = jest.mocked(ImageResponse).mock.calls[0];

    render(card);
};

describe("recipe preview image", () => {
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

    it("should show the recipe with its type, author and facts", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);

        await RecipeSocialImage({ params });
        renderCard();

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(screen.getByText("by Test U.")).toBeInTheDocument();
        expect(screen.getByText("2 hr 15 min")).toBeInTheDocument();
        expect(screen.getByText("320 kcal / portion")).toBeInTheDocument();
        expect(screen.getByText("Rated 4.5 from 2 votes")).toBeInTheDocument();
    });

    it("should state only the facts the recipe has", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            ...TEST_UNRATED,
            cooking_time: null,
            calories_per_portion: null,
        });

        await RecipeSocialImage({ params });
        renderCard();

        expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Rated/)).not.toBeInTheDocument();
        expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });

    it("should answer 404 for a recipe that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        const response = await RecipeSocialImage({ params });

        expect(response.status).toBe(404);
        expect(ImageResponse).not.toHaveBeenCalled();
    });
});
