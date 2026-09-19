import { notFound } from "next/navigation";

import type { RecipeDetails } from "types/recipe";

import { fetchAsVisitor } from "api/server";

import RecipeDetailsPage, {
    generateMetadata,
} from "app/(public)/recipe/[id]/page";

jest.mock("api/server", () => ({ fetchAsVisitor: jest.fn() }));

const mockedFetch = fetchAsVisitor as jest.MockedFunction<
    typeof fetchAsVisitor
>;

const SAMPLE: RecipeDetails = {
    id: 7,
    title: "Borscht",
    content: "Boil the beetroot.",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    isOwner: false,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: null,
    calories_override: null,
};

const params = Promise.resolve({ id: "7" });

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

    it("should carry no metadata for a recipe that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        await expect(generateMetadata({ params })).resolves.toEqual({});
    });

    it("should answer 404 for a recipe that does not exist", async () => {
        mockedFetch.mockResolvedValue(null);

        await RecipeDetailsPage({ params });

        expect(notFound).toHaveBeenCalled();
    });
});
