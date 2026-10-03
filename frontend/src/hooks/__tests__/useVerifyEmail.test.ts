import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { useVerifyEmail } from "hooks/useVerifyEmail";

import { makeAxiosError, mockedPost, mockGetByUrl } from "test/apiClientMock";
import { renderHookWithRouter } from "test/store";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

const renderVerify = (url: string) =>
    renderHookWithRouter(() => useVerifyEmail(), { initialEntries: [url] });

describe("useVerifyEmail", () => {
    it("should confirm the token from the link and report success", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
        mockedPost.mockResolvedValue({ data: null });
        const { result } = renderVerify("/verify-email?token=abc123");

        expect(result.current.status).toBe("loading");

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.confirmEmail, {
            token: "abc123",
        });
        expect(result.current.status).toBe("success");
    });

    it("should report a rejected token as invalid", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
        mockedPost.mockRejectedValue(makeAxiosError(400, "Link expired"));
        const { result } = renderVerify("/verify-email?token=stale");

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.status).toBe("invalid");
    });

    it("should report a link without a token as invalid without asking the server", () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: null });
        const { result } = renderVerify("/verify-email");

        expect(result.current.status).toBe("invalid");
        expect(mockedPost).not.toHaveBeenCalled();
    });

    it("should tell a signed-in visitor apart from a guest", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: CURRENT_USER });
        mockedPost.mockResolvedValue({ data: null });
        const { result } = renderVerify("/verify-email?token=abc123");

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.isAuthed).toBe(true);
    });
});
