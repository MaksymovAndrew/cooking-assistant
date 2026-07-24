import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { DeleteAccountModal } from "components/settings/DeleteAccountModal";

import { mockedDelete } from "test/apiClientMock";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const LOGIN = "claude";
const DELETE_ACCOUNT = "Delete account";

const fillAndSubmit = async (password = "secret1!") => {
    await userEvent.type(screen.getByLabelText("Password"), password);
    await userEvent.click(screen.getByRole("button", { name: DELETE_ACCOUNT }));
};

describe("DeleteAccountModal", () => {
    it("should render the warning title and message", () => {
        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={jest.fn()} />,
        );

        expect(screen.getByText("Delete account?")).toBeInTheDocument();
    });

    it("should call onClose when Cancel is clicked", async () => {
        const onClose = jest.fn();

        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={onClose} />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should delete the account and navigate to login on success", async () => {
        mockedDelete.mockResolvedValue({ data: null });

        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={jest.fn()} />,
        );

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

        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={jest.fn()} />,
        );

        await fillAndSubmit("wrong-password");

        expect(screen.getByText("Incorrect password.")).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show a required-password error and not submit when the field is empty", async () => {
        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={jest.fn()} />,
        );

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

        renderWithProviders(
            <DeleteAccountModal login={LOGIN} onClose={jest.fn()} />,
        );

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
