import type { MenuDetails } from "types/menu";

import { menuJsonLd } from "app/[locale]/(public)/menu/[id]/menuJsonLd";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";

const DESCRIPTION = "Quick and light.";
const RECIPE = {
    type_name: "Soup",
    cooking_time: 30,
    creation_date: "2024-01-01",
    calories_per_portion: null,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
};

const SAMPLE: MenuDetails = {
    menu: {
        id: 4,
        title: "Weekday menu",
        categoryname: "Lunch",
        menucontent: DESCRIPTION,
        category_id: 2,
        isOwner: false,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: null,
    },
    recipes: [
        { ...RECIPE, recipe_id: 9, title: "Borscht" },
        { ...RECIPE, recipe_id: 3, title: "Salad" },
    ],
    allergens: [],
};

describe("menuJsonLd", () => {
    it("should list the menu's recipe pages in their order", () => {
        expect(menuJsonLd(SAMPLE, DESCRIPTION)).toEqual({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Weekday menu",
            description: DESCRIPTION,
            url: "http://localhost:8080/menu/4",
            numberOfItems: 2,
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    url: "http://localhost:8080/recipe/9",
                    name: "Borscht",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    url: "http://localhost:8080/recipe/3",
                    name: "Salad",
                },
            ],
        });
    });
});
