import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteMenuModal } from "components/modals/DeleteMenuModal";

import { mockedDelete } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const MENU_ID = 7;
const MENU_TITLE = "Week of Comfort";
const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.deleteMenu,
    menuId: MENU_ID,
    menuTitle: MENU_TITLE,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });
    const view = renderWithProviders(
        <DeleteMenuModal
            modalId={MODAL_ID}
            menuId={MENU_ID}
            menuTitle={MENU_TITLE}
        />,
        { store },
    );

    return view;
};

const clickConfirm = () =>
    userEvent.click(screen.getByRole("button", { name: "Delete menu" }));

describe("DeleteMenuModal", () => {
    it("should render the delete confirmation with the menu title", () => {
        renderOpen();

        expect(
            screen.getByText(
                "Are you sure you want to delete \"Week of Comfort\"? Recipes inside won't be deleted. This action can't be undone.",
            ),
        ).toBeInTheDocument();
    });

    it("should delete the menu, notify, close and navigate on confirm", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await clickConfirm();

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.menu.byId(MENU_ID),
            { params: undefined },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Menu deleted",
            }),
        ]);
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.allMenus);
    });

    it("should close the modal without deleting on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedDelete).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should keep the modal open and not navigate when deletion fails", async () => {
        mockedDelete.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await clickConfirm();

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({ type: "error", message: "Boom" }),
        ]);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
