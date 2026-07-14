import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import ForgotPasswordPage from "pages/auth/ForgotPasswordPage";
import { mockedPost } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const EMAIL = "tester@example.com";

describe("ForgotPasswordPage", () => {
    it("should submit the email and show the check-your-inbox state", async () => {
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<ForgotPasswordPage />);

        await userEvent.type(screen.getByLabelText("Email"), EMAIL);
        await userEvent.click(
            screen.getByRole("button", { name: "Send reset link" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.forgotPassword,
            {
                email: EMAIL,
            },
        );
        expect(screen.getByText("Check your inbox")).toBeInTheDocument();
        expect(
            screen.getByText(
                "No email is sent if the address isn't registered, or if it hasn't been verified yet.",
            ),
        ).toBeInTheDocument();
    });
});
