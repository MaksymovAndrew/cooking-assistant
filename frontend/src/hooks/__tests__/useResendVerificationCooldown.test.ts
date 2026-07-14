import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useResendVerificationCooldown } from "hooks/useResendVerificationCooldown";

import { mockedPost } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const RESEND_COOLDOWN_MS = 60_000;

describe("useResendVerificationCooldown", () => {
    it("should start with no cooldown active", () => {
        const { result } = renderHookWithStore(() =>
            useResendVerificationCooldown(),
        );

        expect(result.current.isOnCooldown).toBe(false);
    });

    it("should call the resend-verification endpoint and enter cooldown on send", () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useResendVerificationCooldown(),
        );

        act(() => {
            result.current.send();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.resendVerificationEmail,
            undefined,
        );
        expect(result.current.isOnCooldown).toBe(true);
    });

    it("should share the cooldown across every hook instance on the same store", () => {
        mockedPost.mockResolvedValue({ data: null });
        const store = makeTestStore();
        const { result: homeResult } = renderHookWithStore(
            () => useResendVerificationCooldown(),
            store,
        );

        act(() => {
            homeResult.current.send();
        });

        // simulates navigating from Home to Settings: a fresh hook instance on the same store
        const { result: settingsResult } = renderHookWithStore(
            () => useResendVerificationCooldown(),
            store,
        );

        expect(settingsResult.current.isOnCooldown).toBe(true);
    });

    it("should clear the cooldown after it expires, for every mounted instance", () => {
        jest.useFakeTimers();

        try {
            mockedPost.mockResolvedValue({ data: null });
            const store = makeTestStore();
            const { result: homeResult } = renderHookWithStore(
                () => useResendVerificationCooldown(),
                store,
            );

            act(() => {
                homeResult.current.send();
            });

            const { result: settingsResult } = renderHookWithStore(
                () => useResendVerificationCooldown(),
                store,
            );

            act(() => {
                jest.advanceTimersByTime(RESEND_COOLDOWN_MS);
            });

            expect(homeResult.current.isOnCooldown).toBe(false);
            expect(settingsResult.current.isOnCooldown).toBe(false);
        } finally {
            jest.useRealTimers();
        }
    });
});
