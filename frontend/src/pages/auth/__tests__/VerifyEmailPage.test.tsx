import { screen } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import VerifyEmailPage from "pages/auth/VerifyEmailPage";
import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const TOKEN = "verify-token";
const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: "2026-01-01T00:00:00.000Z",
};

describe("VerifyEmailPage", () => {
    it("should show the invalid-link state when there is no token in the URL", () => {
        renderWithRouter(<VerifyEmailPage />, ["/verify-email"]);

        expect(screen.getByText("Link invalid or expired")).toBeInTheDocument();
    });

    it("should confirm the email and show the success state for a valid token", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<VerifyEmailPage />, [`/verify-email?token=${TOKEN}`]);

        expect(await screen.findByText("Email verified")).toBeInTheDocument();
        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.confirmEmail, {
            token: TOKEN,
        });
        expect(
            screen.getByRole("link", { name: "Back to log in" }),
        ).toBeInTheDocument();
    });

    it("should offer to continue into the app instead of logging in again when already signed in", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: CURRENT_USER });
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<VerifyEmailPage />, [`/verify-email?token=${TOKEN}`]);

        expect(await screen.findByText("Email verified")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Continue" }),
        ).toBeInTheDocument();
    });

    it("should show the invalid-link state when the token is rejected", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: { error: "This link is invalid or has expired" },
            },
            message: "Request failed",
        });

        renderWithRouter(<VerifyEmailPage />, [`/verify-email?token=${TOKEN}`]);

        expect(
            await screen.findByText("Link invalid or expired"),
        ).toBeInTheDocument();
    });
});
