import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useForgotPasswordForm } from "hooks/useForgotPasswordForm";

import { mockedPost } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const EMAIL = "tester@example.com";

const renderForgotPasswordForm = () =>
    renderHookWithStore(() => useForgotPasswordForm());

describe("useForgotPasswordForm", () => {
    it("should submit the trimmed email and show the submitted state on success", async () => {
        mockedPost.mockResolvedValue({ data: null });

        const { result } = renderForgotPasswordForm();

        act(() => {
            result.current.setEmail(` ${EMAIL} `);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.forgotPassword,
            {
                email: EMAIL,
            },
        );
        expect(result.current.submitted).toBe(true);
    });

    it("should set a required-field error when the email is empty", async () => {
        const { result } = renderForgotPasswordForm();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
        expect(result.current.submitted).toBe(false);
    });

    it("should set an invalid-email error without submitting", async () => {
        const { result } = renderForgotPasswordForm();

        act(() => {
            result.current.setEmail("not-an-email");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe(
            "Please enter a valid email address.",
        );
    });

    it("should set a rate-limit error when throttled", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 429,
                    data: { error: "Too many requests" },
                    headers: { "retry-after": "30" },
                },
            }),
        );

        const { result } = renderForgotPasswordForm();

        act(() => {
            result.current.setEmail(EMAIL);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "Too many attempts. Please wait 30 seconds.",
        );
        expect(result.current.submitted).toBe(false);
    });

    it("should set a server error message for a 5xx response", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: { status: 500, data: { error: "Boom" } },
            }),
        );

        const { result } = renderForgotPasswordForm();

        act(() => {
            result.current.setEmail(EMAIL);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "A server error occurred. Please try again.",
        );
    });
});
