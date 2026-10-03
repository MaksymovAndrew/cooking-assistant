import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import ChangeRecipePage from "app/[locale]/(private)/change-recipe/[id]/page";
import {
    makeAxiosError,
    mockedGet,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import {
    ERROR_COOKING_TIME_FORMAT,
    LABEL_COOKING_TIME,
    MOCK_ERROR_SERVER,
    ROUTE_ALL_RECIPES,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { setTestParams } from "test/nextNavigationMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TITLE = "Borscht";
const NEW_TITLE = "Beetroot borscht";
const UPDATE_RECIPE = "Save changes";
const SAMPLE: RecipeDetails = {
    id: 1,
    title: TITLE,
    language: "en",
    content: "boil",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    isOwner: true,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: null,
    calories_override: null,
};

const setup = (recipe: RecipeDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.recipes.byId("1")]: recipe,
        [API_ROUTES.ingredients.list]: [],
        [API_ROUTES.recipeTypes.list]: [],
    });
    const store = makeTestStore();

    setTestParams({ id: "1" });
    renderWithProviders(<ChangeRecipePage />, {
        store,
        initialEntries: ["/change-recipe/1"],
    });

    return { store };
};

const submit = () =>
    userEvent.click(screen.getByRole("button", { name: UPDATE_RECIPE }));

describe("ChangeRecipePage", () => {
    it("should show a cooking-time error when submitting with invalid time", async () => {
        setup();

        await screen.findByDisplayValue(TITLE);

        const cookingTimeInput = screen.getByLabelText(LABEL_COOKING_TIME);

        await userEvent.clear(cookingTimeInput);
        await userEvent.type(cookingTimeInput, "invalid");
        await submit();

        expect(screen.getByText(ERROR_COOKING_TIME_FORMAT)).toBeInTheDocument();
    });

    it("should save the changed recipe and go back to the recipe list", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        const titleInput = await screen.findByDisplayValue(TITLE);

        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, NEW_TITLE);
        await submit();

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            expect.objectContaining({ title: NEW_TITLE, cooking_time: 60 }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should notify with an error when the update fails", async () => {
        mockedPut.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: MOCK_ERROR_SERVER } },
            message: "Request failed",
        });
        const { store } = setup();

        await screen.findByDisplayValue(TITLE);
        await submit();

        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "error",
                message: MOCK_ERROR_SERVER,
            }),
        ]);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show a skeleton, not an empty form, while the recipe loads", async () => {
        setup();

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(
            screen.queryByRole("button", { name: UPDATE_RECIPE }),
        ).not.toBeInTheDocument();
        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });

    it("should say the recipe cannot be edited when it does not exist", async () => {
        mockedGet.mockRejectedValue(makeAxiosError(404, "Not found"));
        setTestParams({ id: "1" });
        renderWithProviders(<ChangeRecipePage />);

        expect(
            await screen.findByText("This recipe can't be edited"),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: UPDATE_RECIPE }),
        ).not.toBeInTheDocument();
    });

    it("should offer a retry when the recipe fails to load", async () => {
        mockGetByUrl({
            [API_ROUTES.recipes.byId("1")]: SAMPLE,
            [API_ROUTES.ingredients.list]: [],
            [API_ROUTES.recipeTypes.list]: [],
        });
        const loadByUrl = mockedGet.getMockImplementation();
        let failures = 1;

        mockedGet.mockImplementation((url: string) => {
            if (url === API_ROUTES.recipes.byId("1") && failures > 0) {
                failures -= 1;

                return Promise.reject(makeAxiosError(500, "Boom"));
            }

            return loadByUrl ? loadByUrl(url) : Promise.reject(new Error(url));
        });
        setTestParams({ id: "1" });
        renderWithProviders(<ChangeRecipePage />);

        await userEvent.click(
            await screen.findByRole("button", { name: "Try again" }),
        );

        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });

    it("should say the recipe cannot be edited when it belongs to someone else", async () => {
        setup({ ...SAMPLE, isOwner: false });

        expect(
            await screen.findByText("This recipe can't be edited"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Back to recipes" }),
        ).toHaveAttribute("href", ROUTE_ALL_RECIPES);
        expect(
            screen.queryByRole("button", { name: UPDATE_RECIPE }),
        ).not.toBeInTheDocument();
    });
});
