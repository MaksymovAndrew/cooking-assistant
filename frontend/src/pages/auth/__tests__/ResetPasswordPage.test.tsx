import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import ResetPasswordPage from "pages/auth/ResetPasswordPage";
import { mockedPost } from "test/apiClientMock";
import { ROUTE_LOGIN } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const TOKEN = "reset-token";
const NEW_PASSWORD = "new-secret1!";

describe("ResetPasswordPage", () => {
    it("should reset the password and navigate to login on success", async () => {
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<ResetPasswordPage />, [
            `/reset-password?token=${TOKEN}`,
        ]);

        await userEvent.type(
            screen.getByLabelText("New password"),
            NEW_PASSWORD,
        );
        await userEvent.type(
            screen.getByLabelText("Confirm password"),
            NEW_PASSWORD,
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Reset password" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.resetPassword, {
            token: TOKEN,
            newPassword: NEW_PASSWORD,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_LOGIN);
    });

    it("should show the invalid-link state when there is no token in the URL", () => {
        renderWithRouter(<ResetPasswordPage />, ["/reset-password"]);

        expect(screen.getByText("Link invalid or expired")).toBeInTheDocument();
        expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
    });
});
