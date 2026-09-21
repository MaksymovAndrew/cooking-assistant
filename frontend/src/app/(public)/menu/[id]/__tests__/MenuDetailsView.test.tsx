import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import { MenuDetailsView } from "app/(public)/menu/[id]/MenuDetailsView";
import { mockedDelete, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_MENU,
    BTN_EDIT_MENU,
    ROUTE_ALL_MENUS,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TITLE = "Weekday menu";
const SAMPLE: MenuDetails = {
    menu: {
        id: 1,
        title: TITLE,
        categoryname: "Lunch",
        menucontent: "quick",
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

// the menu itself comes from the server render now, as a prop; AppShell (via
// AppHeader/useExpiredIngredientsNotice) still hits getMe and the pantry list from the browser
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

describe("MenuDetailsView", () => {
    it("should render the menu title it is given", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: TITLE }),
        ).toBeInTheDocument();
    });

    it("should render the menu's recipes and its missing ingredients", () => {
        renderPage();

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("2 piece")).toBeInTheDocument();
    });

    it("should show Edit and Delete buttons when current user is the menu owner", () => {
        renderPage();

        expect(
            screen.getByRole("link", { name: BTN_EDIT_MENU }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        ).toBeInTheDocument();
    });

    it("should open the global delete modal and navigate to /menu after delete", async () => {
        mockedDelete.mockResolvedValue({ data: null });

        const { store } = renderPage();

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        );

        expect(selectActiveModal(store.getState())?.type).toBe(
            MODAL_TYPE.deleteMenu,
        );

        const dialog = await screen.findByRole("dialog");

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_MENU }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), {
            params: undefined,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should close the modal when Cancel is clicked", async () => {
        const { store } = renderPage();

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not show the log-intake button when no recipe has calorie data", () => {
        renderPage();

        expect(
            screen.queryByRole("button", { name: "Log intake" }),
        ).not.toBeInTheDocument();
    });

    it("should open the log-intake modal with the summed calories across recipes", async () => {
        const { store } = renderPage(SAMPLE_WITH_CALORIES);

        const triggers = screen.getAllByRole("button", {
            name: "Log intake",
        });

        await userEvent.click(triggers[0]);

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.logIntake,
            menuId: 1,
            title: TITLE,
            caloriesPerPortion: 600,
        });
    });

    it("should not render the missing-ingredients aside for a guest when the menu has no allergens", () => {
        renderPage(SAMPLE, makeTestStore({ session: { status: "guest" } }));

        expect(screen.queryByText("Carrot")).not.toBeInTheDocument();
        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });
});
