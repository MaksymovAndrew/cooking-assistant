import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import { MenuDetailsView } from "app/[locale]/(public)/menu/[id]/MenuDetailsView";
import { mockedDelete, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_MENU,
    ROUTE_ALL_MENUS,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TITLE = "Weekday menu";
const LOG_INTAKE_BUTTON = "Log intake";
const DELETE_DIALOG = "Delete menu?";
const SAMPLE: MenuDetails = {
    menu: {
        creation_date: "2026-01-01T00:00:00.000Z",
        id: 1,
        title: TITLE,
        language: "en",
        categoryName: "Lunch",
        menuContent: "quick",
        category_id: 2,
        isOwner: true,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: false,
    },
    recipes: [
        {
            recipe_id: 10,
            title: "Soup",
            language: "en",
            type_name: "Soup",
            cooking_time: 30,
            creation_date: "2024-01-01",
            calories_per_portion: null,
            photo_key: null,
            ratingAverage: null,
            ratingCount: 0,
            missingIngredients: [
                {
                    ingredient_id: 7,
                    ingredient_slug: "carrot",
                    ingredient_name: "Carrot",
                    needed_quantity: 2,
                    missing_quantity: 2,
                    unit_name: "piece",
                },
            ],
        },
    ],
    allergens: [],
};

const SAMPLE_WITH_CALORIES: MenuDetails = {
    ...SAMPLE,
    recipes: [
        { ...SAMPLE.recipes[0], calories_per_portion: 420 },
        {
            recipe_id: 11,
            title: "Salad",
            language: "en",
            type_name: "Salad",
            cooking_time: 10,
            creation_date: "2024-01-01",
            calories_per_portion: 180,
            photo_key: null,
            ratingAverage: null,
            ratingCount: 0,
        },
    ],
};

// the menu is a prop; AppShell still fetches getMe and the pantry list from the browser
const renderPage = (
    menu: MenuDetails = SAMPLE,
    store = makeTestStore({ session: { status: "authed" } }),
) => {
    mockGetByUrl({
        [API_ROUTES.userIngredients.list]: [],
        [API_ROUTES.auth.me]: {
            id: 1,
            name: "Claude",
            surname: "Cook",
            login: "claude",
        },
    });

    return renderWithProviders(
        <>
            <MenuDetailsView menu={menu} />
            <ModalRoot />
        </>,
        { store, initialEntries: ["/menu/1"] },
    );
};

const openDeleteDialog = async () => {
    await userEvent.click(
        screen.getByRole("button", { name: BTN_DELETE_MENU }),
    );

    return screen.findByRole("dialog", { name: DELETE_DIALOG });
};

describe("MenuDetailsView", () => {
    it("should render the menu's recipes and its missing ingredients", () => {
        renderPage();

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("2 pieces")).toBeInTheDocument();
    });

    it("should title the page with one level-one heading, the menu's own", () => {
        renderPage();

        const headings = screen.getAllByRole("heading", { level: 1 });

        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent(TITLE);
    });

    it("should delete the menu it names once confirmed and go back to the menu list", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        renderPage();

        const dialog = await openDeleteDialog();

        expect(
            within(dialog).getByText(/delete "Weekday menu"/),
        ).toBeInTheDocument();

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_MENU }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), {
            params: undefined,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should close the modal when Cancel is clicked", async () => {
        renderPage();

        const dialog = await openDeleteDialog();

        await userEvent.click(
            within(dialog).getByRole("button", { name: "Cancel" }),
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockedDelete).not.toHaveBeenCalled();
    });

    it("should not show the log-intake button when no recipe has calorie data", () => {
        renderPage();

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should open the log-intake modal with the summed calories across recipes", async () => {
        renderPage(SAMPLE_WITH_CALORIES);

        const triggers = screen.getAllByRole("button", {
            name: LOG_INTAKE_BUTTON,
        });

        await userEvent.click(triggers[0]);

        const dialog = await screen.findByRole("dialog", {
            name: LOG_INTAKE_BUTTON,
        });

        expect(within(dialog).getByText(TITLE)).toBeInTheDocument();
        expect(within(dialog).getByText("600 kcal total")).toBeInTheDocument();
    });

    it("should not render the missing-ingredients aside for a guest when the menu has no allergens", () => {
        renderPage(SAMPLE, makeTestStore({ session: { status: "guest" } }));

        expect(screen.queryByText("Carrot")).not.toBeInTheDocument();
        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    it("should explain a menu whose recipes were all deleted and offer nothing to cook or log", () => {
        renderPage({ ...SAMPLE, recipes: [] });

        expect(
            screen.getByText("The recipes in this menu were removed"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Add recipes/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /Log intake|Cooked it/ }),
        ).not.toBeInTheDocument();
    });
});
