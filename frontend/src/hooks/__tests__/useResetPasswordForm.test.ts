import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { useResetPasswordForm } from "hooks/useResetPasswordForm";

import { mockedPost } from "test/apiClientMock";
import { ROUTE_LOGIN } from "test/constants";
import { mockNavigate } from "test/router";
import { renderHookWithStore } from "test/store";

const mockUseSearchParams = jest.fn<
    ReturnType<typeof ReactRouterDom.useSearchParams>,
    []
>();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
    useSearchParams: () => mockUseSearchParams(),
}));
jest.mock("api/client");

const TOKEN = "reset-token";
const NEW_PASSWORD = "new-secret1!";

const withToken = (token: string | null) => {
    mockUseSearchParams.mockReturnValue([
        new URLSearchParams(token ? { token } : {}),
        jest.fn(),
    ]);
};

const renderResetPasswordForm = () =>
    renderHookWithStore(() => useResetPasswordForm());

describe("useResetPasswordForm", () => {
    it("should start with tokenInvalid when the URL has no token", () => {
        withToken(null);

        const { result } = renderResetPasswordForm();

        expect(result.current.tokenInvalid).toBe(true);
    });

    it("should reset the password and navigate to login on success", async () => {
        withToken(TOKEN);
        mockedPost.mockResolvedValue({ data: null });

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword(NEW_PASSWORD);
        });
        act(() => {
            result.current.setConfirmPassword(NEW_PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.resetPassword, {
            token: TOKEN,
            newPassword: NEW_PASSWORD,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_LOGIN);
    });

    it("should set a required-fields error when a field is empty", async () => {
        withToken(TOKEN);

        const { result } = renderResetPasswordForm();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
    });

    it("should reject a short password without submitting", async () => {
        withToken(TOKEN);

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword("short");
        });
        act(() => {
            result.current.setConfirmPassword("short");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe(
            "Password must be at least 8 characters and include a letter, a number, and a special character.",
        );
    });

    it("should reject mismatched passwords without submitting", async () => {
        withToken(TOKEN);

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword(NEW_PASSWORD);
        });
        act(() => {
            result.current.setConfirmPassword("different-secret");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Passwords do not match.");
    });

    it("should flip to tokenInvalid when the server rejects the token", async () => {
        withToken(TOKEN);
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: {
                        error: "This link is invalid or has expired",
                        code: "auth/invalid_or_expired_token",
                    },
                },
            }),
        );

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword(NEW_PASSWORD);
        });
        act(() => {
            result.current.setConfirmPassword(NEW_PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.tokenInvalid).toBe(true);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should set a specific error when the new password matches the current one", async () => {
        withToken(TOKEN);
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {
                        error: "New password must be different from your current password",
                        code: ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT,
                    },
                },
            }),
        );

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword(NEW_PASSWORD);
        });
        act(() => {
            result.current.setConfirmPassword(NEW_PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "New password must be different from your current password.",
        );
        expect(result.current.tokenInvalid).toBe(false);
    });

    it("should set a server error message for a 5xx response", async () => {
        withToken(TOKEN);
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: { status: 500, data: { error: "Boom" } },
            }),
        );

        const { result } = renderResetPasswordForm();

        act(() => {
            result.current.setNewPassword(NEW_PASSWORD);
        });
        act(() => {
            result.current.setConfirmPassword(NEW_PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "A server error occurred. Please try again.",
        );
        expect(result.current.tokenInvalid).toBe(false);
    });
});
