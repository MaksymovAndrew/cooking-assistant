import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ChangePasswordModal } from "components/settings/ChangePasswordModal";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const CURRENT_PASSWORD = "old-secret";
const NEW_PASSWORD = "new-secret1!";
const MODAL_ID = "m1";

const renderOpen = () =>
    renderWithProviders(<ChangePasswordModal modalId={MODAL_ID} />, {
        store: makeTestStore({
            ui: { queue: [{ id: MODAL_ID, type: MODAL_TYPE.changePassword }] },
        }),
    });

const fillAndSave = async (newPassword = NEW_PASSWORD) => {
    await userEvent.type(
        screen.getByLabelText("Current password"),
        CURRENT_PASSWORD,
    );
    await userEvent.type(screen.getByLabelText("New password"), NEW_PASSWORD);
    await userEvent.type(
        screen.getByLabelText("Confirm new password"),
        newPassword,
    );
    await userEvent.click(
        screen.getByRole("button", { name: "Save password" }),
    );
};

describe("ChangePasswordModal", () => {
    it("should change the password, notify and close on success", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderOpen();

        await fillAndSave();

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.changePassword,
            { currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Password changed",
            }),
        ]);
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should disable the submit button while the request is in flight", async () => {
        mockedPost.mockReturnValue(new Promise(() => undefined));

        renderOpen();

        await fillAndSave();

        expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    });

    it("should close the modal when Cancel is clicked", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should show a required-fields error and not submit when a field is empty", async () => {
        renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: "Save password" }),
        );

        expect(mockedPost).not.toHaveBeenCalled();
        expect(
            screen.getByText("Please fill in all fields."),
        ).toBeInTheDocument();
    });

    it("should show a mismatch error and not submit when passwords differ", async () => {
        renderOpen();

        await fillAndSave("different-secret");

        expect(mockedPost).not.toHaveBeenCalled();
        expect(
            screen.getByText("New passwords do not match."),
        ).toBeInTheDocument();
    });

    it("should show the current-password-incorrect error and keep the modal open", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: {
                    error: "Current password is incorrect",
                    code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
                },
            },
            message: "Request failed",
        });
        const { store } = renderOpen();

        await fillAndSave();

        expect(
            screen.getByText("Current password is incorrect."),
        ).toBeInTheDocument();
        expect(selectActiveModal(store.getState())?.id).toBe(MODAL_ID);
    });
});
