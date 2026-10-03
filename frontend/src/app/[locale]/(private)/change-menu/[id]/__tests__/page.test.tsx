import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import ChangeMenuPage from "app/[locale]/(private)/change-menu/[id]/page";
import {
    makeAxiosError,
    mockedGet,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import {
    ERROR_RECIPES_REQUIRED,
    ROUTE_ALL_MENUS,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { setTestParams } from "test/nextNavigationMock";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");

const TITLE = "Weekday menu";
const NEW_TITLE = "Weekend menu";
const UPDATE_MENU = "Save changes";
const CATEGORY_ID = 2;
const MENU_RECIPE = {
    id: 10,
    recipe_id: 10,
    title: "Borscht",
    language: "en" as const,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    calories_per_portion: null,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
};
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];

const SAMPLE: MenuDetails = {
    menu: {
        creation_date: "2026-01-01T00:00:00.000Z",
        id: 1,
        title: TITLE,
        language: "en",
        categoryName: "Lunch",
        menuContent: "quick",
        category_id: CATEGORY_ID,
        isOwner: true,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: false,
    },
    recipes: [],
    allergens: [],
};

const SAMPLE_WITH_RECIPE: MenuDetails = {
    ...SAMPLE,
    recipes: [MENU_RECIPE],
};

const setup = (sample: MenuDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.menu.byId("1")]: sample,
        [API_ROUTES.menuCategories.list]: CATEGORIES,
    });

    setTestParams({ id: "1" });
    renderWithProviders(<ChangeMenuPage />, {
        initialEntries: ["/change-menu/1"],
    });
};

describe("ChangeMenuPage", () => {
    it("should save the changed menu and go back to the menu list", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup(SAMPLE_WITH_RECIPE);

        const titleInput = await screen.findByDisplayValue(TITLE);

        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, NEW_TITLE);
        await userEvent.click(
            screen.getByRole("button", { name: UPDATE_MENU }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.menu.byId("1"),
            expect.objectContaining({
                menuTitle: NEW_TITLE,
                categoryId: CATEGORY_ID,
                recipeIds: [MENU_RECIPE.id],
            }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should display a validation error when no recipes are selected", async () => {
        setup();

        await screen.findByDisplayValue(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: UPDATE_MENU }),
        );

        expect(screen.getByText(ERROR_RECIPES_REQUIRED)).toBeInTheDocument();
    });

    it("should show a skeleton, not an empty form, while the menu loads", async () => {
        setup();

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(
            screen.queryByRole("button", { name: UPDATE_MENU }),
        ).not.toBeInTheDocument();
        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });

    it("should say the menu cannot be edited when it does not exist", async () => {
        mockedGet.mockRejectedValue(makeAxiosError(404, "Not found"));
        setTestParams({ id: "1" });
        renderWithProviders(<ChangeMenuPage />);

        expect(
            await screen.findByText("This menu can't be edited"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Back to menus" }),
        ).toHaveAttribute("href", ROUTE_ALL_MENUS);
    });

    it("should say the menu cannot be edited when it belongs to someone else", async () => {
        setup({ ...SAMPLE, menu: { ...SAMPLE.menu, isOwner: false } });

        expect(
            await screen.findByText("This menu can't be edited"),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: UPDATE_MENU }),
        ).not.toBeInTheDocument();
    });

    it("should offer a retry when the menu fails to load", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.byId("1")]: SAMPLE,
            [API_ROUTES.menuCategories.list]: CATEGORIES,
        });
        const loadByUrl = mockedGet.getMockImplementation();
        let failures = 1;

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.menu.byId("1") && failures > 0) {
                failures -= 1;

                return Promise.reject(makeAxiosError(500, "Boom"));
            }

            return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
        });
        setTestParams({ id: "1" });
        renderWithProviders(<ChangeMenuPage />);

        await userEvent.click(
            await screen.findByRole("button", { name: "Try again" }),
        );

        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });
});
