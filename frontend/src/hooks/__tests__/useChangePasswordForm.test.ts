import { act } from "@testing-library/react";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { useChangePasswordForm } from "hooks/useChangePasswordForm";

import { mockedPost } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const CURRENT_PASSWORD = "old-secret";
const NEW_PASSWORD = "new-secret1!";

const renderChangePasswordForm = (onSuccess: () => void) =>
    renderHookWithStore(() => useChangePasswordForm(onSuccess));

const fillFields = (
    result: { current: ReturnType<typeof useChangePasswordForm> },
    newPassword = NEW_PASSWORD,
) => {
    act(() => {
        result.current.setCurrentPassword(CURRENT_PASSWORD);
    });
    act(() => {
        result.current.setNewPassword(NEW_PASSWORD);
    });
    act(() => {
        result.current.setConfirmPassword(newPassword);
    });
};

describe("useChangePasswordForm", () => {
    it("should submit the passwords and call onSuccess", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const onSuccess = jest.fn();

        const { result } = renderChangePasswordForm(onSuccess);

        fillFields(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.changePassword,
            { currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD },
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("should set a required-fields error when a field is empty", async () => {
        const { result } = renderChangePasswordForm(jest.fn());

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
    });

    it("should reject a short new password without submitting", async () => {
        const { result } = renderChangePasswordForm(jest.fn());

        act(() => {
            result.current.setCurrentPassword(CURRENT_PASSWORD);
        });
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

    it("should reject mismatched new passwords without submitting", async () => {
        const { result } = renderChangePasswordForm(jest.fn());

        fillFields(result, "different-secret");

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("New passwords do not match.");
    });

    it("should set a specific error when the current password is wrong", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: {
                        error: "Current password is incorrect",
                        code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
                    },
                },
            }),
        );
        const onSuccess = jest.fn();

        const { result } = renderChangePasswordForm(onSuccess);

        fillFields(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe("Current password is incorrect.");
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should set a specific error when the new password matches the current one", async () => {
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
        const onSuccess = jest.fn();

        const { result } = renderChangePasswordForm(onSuccess);

        fillFields(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "New password must be different from your current password.",
        );
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should set a generic error for an unrecognized failure", async () => {
        mockedPost.mockRejectedValue(
            Object.assign(new Error(), {
                isAxiosError: true,
                response: { status: 500, data: { error: "Boom" } },
            }),
        );

        const { result } = renderChangePasswordForm(jest.fn());

        fillFields(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "Something went wrong. Please try again.",
        );
    });
});
