import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { DeleteAccountModal } from "components/settings/DeleteAccountModal";

import { mockedDelete } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const LOGIN = "claude";
const DELETE_ACCOUNT = "Delete account";
const MODAL_ID = "m1";

const renderOpen = () =>
    renderWithProviders(
        <DeleteAccountModal modalId={MODAL_ID} login={LOGIN} />,
        {
            store: makeTestStore({
                ui: {
                    queue: [
                        {
                            id: MODAL_ID,
                            type: MODAL_TYPE.deleteAccount,
                            login: LOGIN,
                        },
                    ],
                },
            }),
        },
    );

const fillAndSubmit = async (password = "secret1!") => {
    await userEvent.type(screen.getByLabelText("Password"), password);
    await userEvent.click(screen.getByRole("button", { name: DELETE_ACCOUNT }));
};

describe("DeleteAccountModal", () => {
    it("should close the modal when Cancel is clicked", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should delete the account and navigate to login on success", async () => {
        mockedDelete.mockResolvedValue({ data: null });

        renderOpen();

        await fillAndSubmit("secret1!");

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            data: { password: "secret1!" },
            params: undefined,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.login);
    });

    it("should show an inline error and not navigate for the wrong password", async () => {
        mockedDelete.mockRejectedValue({
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

        renderOpen();

        await fillAndSubmit("wrong-password");

        expect(screen.getByText("Incorrect password.")).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show a required-password error and not submit when the field is empty", async () => {
        renderOpen();

        await userEvent.click(
            screen.getByRole("button", { name: DELETE_ACCOUNT }),
        );

        expect(mockedDelete).not.toHaveBeenCalled();
        expect(
            screen.getByText("Please enter your password."),
        ).toBeInTheDocument();
    });

    it("should lock out and disable the submit button after repeated wrong passwords", async () => {
        mockedDelete.mockRejectedValue({
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

        renderOpen();

        for (let i = 0; i < 5; i += 1) {
            await fillAndSubmit("wrong-password");

            if (i < 4) {
                await userEvent.clear(screen.getByLabelText("Password"));
            }
        }

        expect(
            screen.getByRole("button", { name: DELETE_ACCOUNT }),
        ).toBeDisabled();
        expect(mockedDelete).toHaveBeenCalledTimes(5);
    });
});
