import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import MenuDetailsPage from "pages/menu/MenuDetailsPage";
import { mockedDelete, mockedGet, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_MENU,
    BTN_EDIT_MENU,
    ROUTE_ALL_MENUS,
} from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const TITLE = "Weekday menu";
const OWNER_ID = 5;
const SAMPLE: MenuDetails = {
    menu: {
        id: 1,
        title: TITLE,
        categoryname: "Lunch",
        menucontent: "quick",
        category_id: 2,
        personid: OWNER_ID,
        isOwner: true,
    },
    recipes: [
        {
            recipe_id: 10,
            title: "Soup",
            type_name: "Soup",
            cooking_time: 30,
            creation_date: "2024-01-01",
            calories_per_portion: null,
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

// AppShell (via AppHeader/useExpiredIngredientsNotice) also hits getMe and the pantry list - scope every GET by url instead of blanket-resolving to the menu payload
const mockMenuDetails = () => {
    mockGetByUrl({
        [API_ROUTES.menu.byId(1)]: SAMPLE,
        [API_ROUTES.userIngredients.list]: [],
        [API_ROUTES.auth.me]: null,
    });
};

const renderPage = (store = makeTestStore()) => {
    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/menu/1"]}>
                <Routes>
                    <Route
                        path="/menu/:id"
                        element={
                            <>
                                <MenuDetailsPage />
                                <ModalRoot />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

    return { store, ...view };
};

describe("MenuDetailsPage", () => {
    it("should render the menu title loaded from the api", async () => {
        mockMenuDetails();

        renderPage();

        expect(
            await screen.findByRole("heading", { name: TITLE }),
        ).toBeInTheDocument();
    });

    it("should render the menu's recipes and its missing ingredients", async () => {
        mockMenuDetails();

        renderPage();
        await screen.findByRole("heading", { name: TITLE });

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Carrot")).toBeInTheDocument();
        expect(screen.getByText("2 piece")).toBeInTheDocument();
    });

    it("should show Edit and Delete buttons when current user is the menu owner", async () => {
        mockMenuDetails();

        renderPage();
        await screen.findByRole("heading", { name: TITLE });

        expect(
            screen.getByRole("link", { name: BTN_EDIT_MENU }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        ).toBeInTheDocument();
    });

    it("should open the global delete modal and navigate to /menu after delete", async () => {
        mockMenuDetails();
        mockedDelete.mockResolvedValue({ data: null });

        const { store } = renderPage();

        await screen.findByRole("heading", { name: TITLE });

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        );

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.deleteMenu);

        const dialog = screen.getByRole("dialog");

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_MENU }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.byId(1), {
            params: undefined,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should render the error state when loading the menu fails", async () => {
        mockedGet.mockRejectedValue(new Error("boom"));

        renderPage();

        expect(
            await screen.findByText("Error: Error fetching menu details"),
        ).toBeInTheDocument();
    });

    it("should render a translated Try again button, not a raw i18n key", async () => {
        mockedGet.mockRejectedValue(new Error("boom"));

        renderPage();

        expect(
            await screen.findByRole("button", { name: "Try again" }),
        ).toBeInTheDocument();
    });

    it("should close the modal when Cancel is clicked", async () => {
        mockMenuDetails();

        const { store } = renderPage();

        await screen.findByRole("heading", { name: TITLE });

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_MENU }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
