import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PAGE_SIZE } from "constants/pagination";
import type { RecipeListItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { RecipePicker } from "components/menu/RecipePicker";

import { byOffset, mockedGet } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const SEARCH_PLACEHOLDER = "Search recipes…";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const LOAD_MORE = "Show more recipes";

const recipe = (id: number, title: string): RecipeListItem => ({
    id,
    title,
    type_name: "Soup",
    creation_date: "",
    cooking_time: 30,
});

const POTATO = recipe(1, "Potato soup");
const PEA = recipe(2, "Pea soup");
const LATE = recipe(3, "Leek soup");

const serveSoups = () => {
    mockedGet.mockImplementation((_url: string, config: unknown) =>
        Promise.resolve({
            data:
                byOffset(config) === 0
                    ? { items: [POTATO, PEA], total: 3 }
                    : { items: [LATE], total: 3 },
        }),
    );
};

const renderPicker = (selectedIds: number[] = [], onToggle = jest.fn()) =>
    renderWithRouter(
        <RecipePicker
            selectedIds={selectedIds}
            label="Recipes"
            onToggle={onToggle}
        />,
    );

const search = async (query: string) => {
    const user = setupUser();

    await user.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), query);
    act(() => {
        jest.advanceTimersByTime(DEBOUNCE_MS);
    });
    // the store batches its updates on a timer of its own
    await act(async () => {
        await jest.runOnlyPendingTimersAsync();
    });

    return user;
};

describe("RecipePicker", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should not search before a query is typed", () => {
        renderPicker();

        expect(mockedGet).not.toHaveBeenCalled();
        expect(
            screen.queryByRole("button", { name: /Potato/ }),
        ).not.toBeInTheDocument();
    });

    it("should search the server by name and show what it found", async () => {
        serveSoups();
        renderPicker();

        await search("soup");

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.recipes.byFilters, {
            params: { recipe_name: "soup", limit: PAGE_SIZE, offset: 0 },
        });
        expect(
            screen.getByRole("button", { name: /Potato/ }),
        ).toBeInTheDocument();
    });

    it("should leave out recipes the menu already holds", async () => {
        serveSoups();
        renderPicker([POTATO.id]);

        await search("soup");

        expect(
            screen.queryByRole("button", { name: /Potato/ }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Pea/ })).toBeInTheDocument();
    });

    it("should show a no-matches message when nothing matches", async () => {
        mockedGet.mockResolvedValue({ data: { items: [], total: 0 } });
        renderPicker();

        await search("zzz");

        expect(screen.getByText("No recipes found")).toBeInTheDocument();
    });

    it("should not say nothing matches while more pages are left to load", async () => {
        serveSoups();
        renderPicker([POTATO.id, PEA.id]);

        await search("soup");

        expect(screen.queryByText("No recipes found")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: LOAD_MORE }),
        ).toBeInTheDocument();
    });

    it("should load the next page of matches on request", async () => {
        serveSoups();
        renderPicker();

        const user = await search("soup");

        await user.click(screen.getByRole("button", { name: LOAD_MORE }));

        expect(
            await screen.findByRole("button", { name: /Leek/ }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: LOAD_MORE }),
        ).not.toBeInTheDocument();
    });

    it("should call onToggle and clear the query when a result is selected", async () => {
        const onToggle = jest.fn();

        serveSoups();
        renderPicker([], onToggle);

        const user = await search("soup");

        await user.click(screen.getByRole("button", { name: /Potato/ }));

        expect(onToggle).toHaveBeenCalledWith(POTATO);
        expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue("");
    });
});
