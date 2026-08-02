import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { authApi } from "redux/services/authApi";

import { useEmailVerificationNudge } from "hooks/useEmailVerificationNudge";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { makeTestStore, renderHookWithStore } from "test/store";

jest.mock("api/client");

const UNVERIFIED_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    calorie_goal: null,
    meal_calorie_limit: null,
};
const VERIFIED_USER: CurrentUser = {
    ...UNVERIFIED_USER,
    email_verified_at: "2026-01-01T00:00:00.000Z",
};

const setup = async (currentUser: CurrentUser | null) => {
    mockGetByUrl({ [API_ROUTES.auth.me]: currentUser });

    const store = makeTestStore();

    await store.dispatch(authApi.endpoints.getMe.initiate(null));

    return renderHookWithStore(() => useEmailVerificationNudge(), store);
};

describe("useEmailVerificationNudge", () => {
    it("should show the nudge while the email is unverified", async () => {
        const { result } = await setup(UNVERIFIED_USER);

        expect(result.current.show).toBe(true);
    });

    it("should not show the nudge once the email is verified", async () => {
        const { result } = await setup(VERIFIED_USER);

        expect(result.current.show).toBe(false);
    });

    it("should hide the nudge after dismiss", async () => {
        const { result } = await setup(UNVERIFIED_USER);

        act(() => {
            result.current.dismiss();
        });

        expect(result.current.show).toBe(false);
    });

    it("should call the resend-verification endpoint and disable further sends on sendEmail", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { result } = await setup(UNVERIFIED_USER);

        act(() => {
            result.current.sendEmail();
        });

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.resendVerificationEmail,
            undefined,
        );
        expect(result.current.isSendDisabled).toBe(true);
    });
});
