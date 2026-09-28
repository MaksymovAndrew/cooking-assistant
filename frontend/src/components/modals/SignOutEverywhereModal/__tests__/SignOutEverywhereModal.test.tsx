import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { SignOutEverywhereModal } from "components/modals/SignOutEverywhereModal";

import { mockedPost } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const MODAL_ID = "m1";
const MODAL: ActiveModal = {
    id: MODAL_ID,
    type: MODAL_TYPE.signOutEverywhere,
};

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });

    return renderWithProviders(<SignOutEverywhereModal modalId={MODAL_ID} />, {
        store,
    });
};

describe("SignOutEverywhereModal", () => {
    it("should explain that this session stays signed in", () => {
        renderOpen();

        expect(
            screen.getByText(/You stay signed in here\./),
        ).toBeInTheDocument();
    });

    it("should end the other sessions, close and stay on the page on confirm", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.signOutEverywhere,
            undefined,
        );
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should close without signing anything out on cancel", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(mockedPost).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should keep the modal open with an inline error when the request fails", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
        expect(screen.getByText("Boom")).toBeInTheDocument();
    });
});
