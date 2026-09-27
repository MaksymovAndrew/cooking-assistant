import i18next from "i18next";

import { API_BASE_URL } from "config/env";
import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { recipeJsonLd } from "app/[locale]/(public)/recipe/[id]/recipeJsonLd";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const SITE = "http://localhost:8080";
const KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";

const DESCRIPTION = "Boil the beetroot.";
const t = i18next.getFixedT("en");
const SAMPLE: RecipeDetails = {
    id: 7,
    title: "Borscht",
    language: "en",
    content: "Boil the beetroot.\n\n  Add the cabbage.  \n",
    ingredients: [
        {
            id: 3,
            slug: "beetroot",
            name: "Beetroot",
            category: "vegetables",
            quantity_recipe_ingredients: 0.333333,
            unit_name: "kg",
            allergens: [],
            calories_per_unit: 430,
        },
    ],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 90,
    creation_date: "2024-01-01",
    isOwner: false,
    photo_key: KEY,
    ratingAverage: 4.25,
    ratingCount: 8,
    myRating: null,
    author: TEST_AUTHOR,
    isFavourite: null,
    containsAvoided: null,
    tags: null,
    calories_per_portion: 312.6,
    calories_override: null,
};

describe("recipeJsonLd", () => {
    it("should describe the recipe the way search engines read one", () => {
        expect(recipeJsonLd(SAMPLE, DESCRIPTION, t, "en")).toEqual({
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: "Borscht",
            inLanguage: "en",
            description: DESCRIPTION,
            url: `${SITE}/recipe/7`,
            image: [
                `${API_BASE_URL}${API_ROUTES.media.social(KEY)}`,
                `${API_BASE_URL}${API_ROUTES.media.file(KEY, 1200)}`,
            ],
            datePublished: "2024-01-01",
            author: { "@type": "Person", name: "Test U." },
            recipeCategory: "Soup",
            totalTime: "PT1H30M",
            recipeIngredient: ["0.33 kg Beetroot"],
            recipeInstructions: [
                { "@type": "HowToStep", text: DESCRIPTION },
                { "@type": "HowToStep", text: "Add the cabbage." },
            ],
            nutrition: {
                "@type": "NutritionInformation",
                calories: "313 calories",
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.3",
                ratingCount: 8,
                bestRating: 5,
                worstRating: 1,
            },
        });
    });

    it("should leave out what the recipe does not have rather than fake it", () => {
        const data = recipeJsonLd(
            {
                ...SAMPLE,
                ...TEST_UNRATED,
                photo_key: null,
                type_name: null,
                cooking_time: null,
                calories_per_portion: null,
            },
            "",
            t,
            "en",
        );
        const serialized = JSON.parse(JSON.stringify(data)) as object;

        expect(serialized).not.toHaveProperty("image");
        expect(serialized).not.toHaveProperty("recipeCategory");
        expect(serialized).not.toHaveProperty("totalTime");
        expect(serialized).not.toHaveProperty("nutrition");
        expect(serialized).not.toHaveProperty("aggregateRating");
    });

    it("should point at the page in its own language", () => {
        expect(recipeJsonLd(SAMPLE, DESCRIPTION, t, "ru").url).toBe(
            `${SITE}/ru/recipe/7`,
        );
    });
});
