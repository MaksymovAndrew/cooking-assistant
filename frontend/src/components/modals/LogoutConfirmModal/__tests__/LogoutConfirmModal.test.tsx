import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { userIngredientsApi } from "redux/services/userIngredientsApi";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { LogoutConfirmModal } from "components/modals/LogoutConfirmModal";

import { mockedGet, mockedPost } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "m1";
const MODAL: ActiveModal = { id: MODAL_ID, type: MODAL_TYPE.logout };

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });
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
        mockedGet.mockResolvedValue({ data: [] });
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderOpen();
        const pantry = store.dispatch(
            userIngredientsApi.endpoints.getUserIngredients.initiate(null),
        );

        await pantry;
        pantry.unsubscribe();

        expect(store.getState().api.queries).not.toEqual({});

        await userEvent.click(screen.getByRole("button", { name: "Log out" }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.logout,
            undefined,
        );
        // the next person on this device must not see the previous one's data
        expect(store.getState().api.queries).toEqual({});
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.login);
    });

    it("should close the modal without logging out on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedPost).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should keep the modal open, show an inline error, and not navigate when logout fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Log out" }));

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText("Boom")).toBeInTheDocument();
    });
});
