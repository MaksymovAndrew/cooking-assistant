import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { ProfileFavouritesTab } from "components/profile/ProfileFavouritesTab";

import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithRouter } from "test/router";

const RECIPE_TITLE = "Borscht";
const MENU_TITLE = "Weekday menu";
const MENUS_SEGMENT = "Menus";

const RECIPE: RecipeSearchResultItem = {
    id: 1,
    title: RECIPE_TITLE,
    type_name: "Soup",
    creation_date: "2024-01-01",
    cooking_time: 60,
    calories_per_portion: null,
    ingredients: [],
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: true,
    containsAvoided: false,
    tags: [],
};
const MENU: Menu = {
    id: 2,
    title: MENU_TITLE,
    categoryname: "Lunch",
    menucontent: "",
    recipe_count: 3,
    isOwner: false,
    isFavourite: true,
};

const makeList = <Item,>(items: Item[]) => ({
    items,
    total: items.length,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
});

describe("ProfileFavouritesTab", () => {
    it("should show favourite recipes by default and switch to favourite menus", async () => {
        renderWithRouter(
            <ProfileFavouritesTab
                recipes={makeList([RECIPE])}
                menus={makeList([MENU])}
            />,
        );

        expect(screen.getByText(RECIPE_TITLE)).toBeInTheDocument();
        expect(screen.queryByText(MENU_TITLE)).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("radio", { name: MENUS_SEGMENT }),
        );

        expect(screen.getByText(MENU_TITLE)).toBeInTheDocument();
        expect(screen.queryByText(RECIPE_TITLE)).not.toBeInTheDocument();
    });

    it("should explain an empty favourites list for each kind", async () => {
        renderWithRouter(
            <ProfileFavouritesTab
                recipes={makeList([])}
                menus={makeList([])}
            />,
        );

        expect(
            screen.getByText(
                "You haven't added any recipes to your favourites yet.",
            ),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("radio", { name: MENUS_SEGMENT }),
        );

        expect(
            screen.getByText(
                "You haven't added any menus to your favourites yet.",
            ),
        ).toBeInTheDocument();
    });
});
