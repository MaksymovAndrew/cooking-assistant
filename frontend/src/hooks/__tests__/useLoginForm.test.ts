import { act } from "@testing-library/react";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import { useLoginForm } from "hooks/useLoginForm";

import { mockedPost } from "test/apiClientMock";
import { ROUTE_HOME } from "test/constants";
import { mockNavigate } from "test/router";
import { renderHookWithStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const makeError = (status: number, retryAfter: number | null = null) =>
    Object.assign(new Error(), {
        isAxiosError: true,
        response: {
            status,
            data: { error: "Rejected" },
            headers:
                retryAfter === null
                    ? {}
                    : { "retry-after": String(retryAfter) },
        },
    });

const renderLoginForm = () => renderHookWithStore(() => useLoginForm());

const fillCredentials = (result: {
    current: ReturnType<typeof useLoginForm>;
}) => {
    act(() => {
        result.current.setField("login", "tester");
    });
    act(() => {
        result.current.setField("password", "secret1");
    });
};

describe("useLoginForm", () => {
    it("should navigate to main on a successful login", async () => {
        mockedPost.mockResolvedValue({ data: null });

        const { result } = renderLoginForm();

        fillCredentials(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.login, {
            login: "tester",
            password: "secret1",
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_HOME);
    });

    it("should set a required-fields error and not call the api when fields are empty", async () => {
        const { result } = renderLoginForm();

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPost).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Please fill in all fields.");
    });

    it("should set a generic error when login fails", async () => {
        mockedPost.mockRejectedValue(makeError(401));

        const { result } = renderLoginForm();

        fillCredentials(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe("Incorrect username or password.");
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show a server error message on 500", async () => {
        mockedPost.mockRejectedValue(makeError(500));

        const { result } = renderLoginForm();

        fillCredentials(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error?.toLowerCase()).toContain("server error");
    });

    it("should not show a toast notification on login error", async () => {
        mockedPost.mockRejectedValue(makeError(401));

        const { result, store } = renderLoginForm();

        fillCredentials(result);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(store.getState().notifications.items).toEqual([]);
    });

    describe("lockout on 429", () => {
        it("should lock and not call the api again while locked", async () => {
            mockedPost.mockRejectedValue(makeError(429));

            const { result } = renderLoginForm();

            fillCredentials(result);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.isLocked).toBe(true);
            expect(mockedPost).toHaveBeenCalledTimes(1);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(mockedPost).toHaveBeenCalledTimes(1);
        });

        it("should re-enable submission after lockout expires", async () => {
            jest.useFakeTimers();
            mockedPost
                .mockRejectedValueOnce(makeError(429))
                .mockResolvedValue({ data: null });

            const { result } = renderLoginForm();

            fillCredentials(result);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.isLocked).toBe(true);

            act(() => {
                jest.advanceTimersByTime(60_000);
            });

            expect(result.current.isLocked).toBe(false);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(mockedPost).toHaveBeenCalledTimes(2);
            jest.useRealTimers();
        });

        it("should report the cool-down in the lockout message", async () => {
            mockedPost.mockRejectedValue(makeError(429));

            const { result } = renderLoginForm();

            fillCredentials(result);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.error).toContain("60");
        });

        it("should use the server Retry-After value for the cool-down when provided", async () => {
            mockedPost.mockRejectedValue(makeError(429, 30));

            const { result } = renderLoginForm();

            fillCredentials(result);

            await act(async () => {
                await result.current.handleSubmit();
            });

            expect(result.current.error).toContain("30");
        });
    });

    describe("client-side escalating lockout", () => {
        const failOnce = async (result: {
            current: ReturnType<typeof useLoginForm>;
        }) => {
            fillCredentials(result);
            await act(async () => {
                await result.current.handleSubmit();
            });
        };

        it("should lock after 5 failed attempts even without a server 429", async () => {
            mockedPost.mockRejectedValue(makeError(401));

            const { result } = renderLoginForm();

            for (let i = 0; i < 5; i += 1) {
                await failOnce(result);
            }

            expect(result.current.isLocked).toBe(true);
            expect(mockedPost).toHaveBeenCalledTimes(5);
        });

        it("should expose a live remaining-time countdown that ticks down while locked", async () => {
            jest.useFakeTimers();
            mockedPost.mockRejectedValue(makeError(401));

            const { result } = renderLoginForm();

            for (let i = 0; i < 5; i += 1) {
                await failOnce(result);
            }

            const initialRemaining = result.current.lockoutRemainingMs;

            expect(initialRemaining).not.toBeNull();

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(result.current.lockoutRemainingMs).toBeLessThan(
                initialRemaining ?? 0,
            );
            jest.useRealTimers();
        });

        it("should persist the lockout across a remount", async () => {
            mockedPost.mockRejectedValue(makeError(401));

            const { result, unmount } = renderLoginForm();

            for (let i = 0; i < 5; i += 1) {
                await failOnce(result);
            }

            unmount();

            const view = renderLoginForm();

            expect(view.result.current.isLocked).toBe(true);
        });

        it("should clear the lockout state on a successful login", async () => {
            mockedPost
                .mockRejectedValueOnce(makeError(401))
                .mockRejectedValueOnce(makeError(401))
                .mockResolvedValue({ data: null });

            const { result } = renderLoginForm();

            await failOnce(result);
            await failOnce(result);
            await failOnce(result);

            expect(localStorage.getItem("cooking.loginLockout")).toBeNull();
        });
    });
});
