import { notFound } from "next/navigation";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor } from "api/server";

import RecipeDetailsPage, {
    generateMetadata,
} from "app/[locale]/(public)/recipe/[id]/page";
import { mockGetByUrl } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/server", () => ({ fetchAsVisitor: jest.fn() }));
jest.mock("api/client");

const mockedFetch = fetchAsVisitor as jest.MockedFunction<
    typeof fetchAsVisitor
>;

const SAMPLE: RecipeDetails = {
    id: 7,
    title: "Borscht",
    language: "en",
    content: "Boil the beetroot.",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: null,
    calories_override: null,
};

const params = Promise.resolve({ locale: "en", id: "7" });

describe("recipe details page", () => {
    it("should describe the recipe it renders, not the app", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);

        const metadata = await generateMetadata({ params });

        expect(metadata.title).toBe("Borscht");
        expect(metadata.description).toBe("Boil the beetroot.");
        expect(metadata.alternates?.canonical).toBe("/recipe/7");
        expect(metadata.openGraph?.title).toBe("Borscht");
    });

    it("should describe a recipe with no description from what it does know", async () => {
        mockedFetch.mockResolvedValue({ ...SAMPLE, content: "" });

        const metadata = await generateMetadata({ params });

        expect(metadata.description).toBe("A soup recipe with 0 ingredients.");
    });

    it("should describe a recipe whose type was deleted without naming one", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            content: "",
            type_id: null,
            type_name: null,
            cooking_time: null,
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.description).toBe("A recipe with 0 ingredients.");
    });

    it("should preview a recipe with a photo as that photo, on a large card", async () => {
        mockedFetch.mockResolvedValue({
            ...SAMPLE,
            photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b",
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.openGraph?.images).toEqual([
            expect.objectContaining({ type: "image/jpeg", alt: "Borscht" }),
        ]);
        expect(metadata.twitter).toEqual(
            expect.objectContaining({ card: "summary_large_image" }),
        );
    });

    it("should put the recipe on the page as structured data", async () => {
        mockedFetch.mockResolvedValue(SAMPLE);
        mockGetByUrl({ [API_ROUTES.userIngredients.list]: [] });

        const { container } = renderWithProviders(
            await RecipeDetailsPage({ params }),
        );

        expect(JSON.parse(container.firstChild?.textContent ?? "")).toEqual(
            expect.objectContaining({ "@type": "Recipe", name: "Borscht" }),
        );
    });

    it("should carry no metadata for a recipe that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        await expect(generateMetadata({ params })).resolves.toEqual({});
    });

    it("should answer 404 for a recipe that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        await expect(RecipeDetailsPage({ params })).rejects.toThrow();
        expect(notFound).toHaveBeenCalled();
    });
});
