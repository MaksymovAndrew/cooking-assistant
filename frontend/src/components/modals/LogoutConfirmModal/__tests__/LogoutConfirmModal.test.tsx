import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { LogoutConfirmModal } from "components/modals/LogoutConfirmModal";

import { mockedPost } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const MODAL_ID = "m1";
const MODAL: ActiveModal = { id: MODAL_ID, type: MODAL_TYPE.logout };

const renderOpen = () => {
    const store = makeTestStore({ ui: { modal: MODAL } });
    const view = renderWithProviders(
        <LogoutConfirmModal modalId={MODAL_ID} />,
        {
            store,
        },
    );

    return view;
};

describe("LogoutConfirmModal", () => {
    it("should render the logout confirmation", () => {
        renderOpen();

        expect(
            screen.getByText(
                "Are you sure you want to log out of your account?",
            ),
        ).toBeInTheDocument();
    });

    it("should log out, reset the cache, close and navigate to login on confirm", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Log out" }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.logout,
            undefined,
        );
        expect(store.getState().ui.modal).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.login);
    });

    it("should close the modal without logging out on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedPost).not.toHaveBeenCalled();
        expect(store.getState().ui.modal).toBeNull();
    });

    it("should keep the modal open and not navigate when logout fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Log out" }));

        expect(store.getState().ui.modal).toEqual(MODAL);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
