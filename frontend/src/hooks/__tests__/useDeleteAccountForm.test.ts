import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";

import { API_ROUTES } from "api/endpoints";

import { useDeleteAccountForm } from "hooks/useDeleteAccountForm";

import { mockedDelete } from "test/apiClientMock";
import { mockNavigate } from "test/router";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const LOGIN = "claude";
const PASSWORD = "secret1!";

const makeError = (
    status: number,
    code?: string,
    retryAfter: number | null = null,
) =>
    Object.assign(new Error(), {
        isAxiosError: true,
        response: {
            status,
            data: { error: "Rejected", code },
            headers:
                retryAfter === null
                    ? {}
                    : { "retry-after": String(retryAfter) },
        },
    });

const renderDeleteAccountForm = () =>
    renderHookWithStore(() => useDeleteAccountForm(LOGIN));

describe("useDeleteAccountForm", () => {
    it("should delete the account and navigate to login on success", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderDeleteAccountForm();

        act(() => {
            result.current.setPassword(PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            data: { password: PASSWORD },
            params: undefined,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.login);
    });

    it("should set a required-password error and not call the api when the field is empty", async () => {
        const { result } = renderDeleteAccountForm();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedDelete).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please enter your password.");
    });

    it("should show an incorrect-password error and not navigate on a wrong password", async () => {
        mockedDelete.mockRejectedValue(
            makeError(401, ERROR_CODES.CURRENT_PASSWORD_INCORRECT),
        );
        const { result } = renderDeleteAccountForm();

        act(() => {
            result.current.setPassword("wrong-password");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe("Incorrect password.");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show a generic error on a server error", async () => {
        mockedDelete.mockRejectedValue(makeError(500));
        const { result } = renderDeleteAccountForm();

        act(() => {
            result.current.setPassword(PASSWORD);
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "Something went wrong. Please try again.",
        );
    });

    describe("lockout on repeated wrong passwords", () => {
        const failOnce = async (result: {
            current: ReturnType<typeof useDeleteAccountForm>;
        }) => {
            act(() => {
                result.current.setPassword("wrong-password");
            });
            await act(async () => {
                await result.current.handleSubmit();
            });
        };

        it("should lock after 5 failed attempts even without a server 429", async () => {
            mockedDelete.mockRejectedValue(
                makeError(401, ERROR_CODES.CURRENT_PASSWORD_INCORRECT),
            );
            const { result } = renderDeleteAccountForm();

            for (let i = 0; i < 5; i += 1) {
                await failOnce(result);
            }

            expect(result.current.isLocked).toBe(true);
            expect(mockedDelete).toHaveBeenCalledTimes(5);
        });

        it("should lock and not call the api again while a server 429 is active", async () => {
            mockedDelete.mockRejectedValue(makeError(429));
            const { result } = renderDeleteAccountForm();

            await failOnce(result);

            expect(result.current.isLocked).toBe(true);
            expect(mockedDelete).toHaveBeenCalledTimes(1);

            await failOnce(result);

            expect(mockedDelete).toHaveBeenCalledTimes(1);
        });

        it("should use the server Retry-After value for the cool-down when provided", async () => {
            mockedDelete.mockRejectedValue(makeError(429, undefined, 30));
            const { result } = renderDeleteAccountForm();

            await failOnce(result);

            expect(result.current.error).toContain("30");
        });

        it("should clear the lockout state on a successful deletion", async () => {
            mockedDelete
                .mockRejectedValueOnce(
                    makeError(401, ERROR_CODES.CURRENT_PASSWORD_INCORRECT),
                )
                .mockResolvedValue({ data: null });
            const { result } = renderDeleteAccountForm();

            await failOnce(result);

            act(() => {
                result.current.setPassword(PASSWORD);
            });
            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(
                localStorage.getItem("cooking.deleteAccountLockout.claude"),
            ).toBeNull();
        });
    });
});
