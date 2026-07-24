import { act } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { useEditProfileForm } from "hooks/useEditProfileForm";

import { mockedPatch } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: "tomato",
};

const renderEditProfileForm = (
    currentUser: CurrentUser | undefined,
    onSuccess: () => void,
) => renderHookWithStore(() => useEditProfileForm(currentUser, onSuccess));

describe("useEditProfileForm", () => {
    it("should prefill name, surname, and avatar from the current user", () => {
        const { result } = renderEditProfileForm(CURRENT_USER, jest.fn());

        expect(result.current.name).toBe("Claude");
        expect(result.current.surname).toBe("Cook");
        expect(result.current.avatar).toBe("tomato");
    });

    it("should default to empty name/surname and no avatar when the current user is not loaded yet", () => {
        const { result } = renderEditProfileForm(undefined, jest.fn());

        expect(result.current.name).toBe("");
        expect(result.current.surname).toBe("");
        expect(result.current.avatar).toBeNull();
    });

    it("should submit the updated fields and call onSuccess", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const onSuccess = jest.fn();

        const { result } = renderEditProfileForm(CURRENT_USER, onSuccess);

        act(() => {
            result.current.setName("Claudia");
        });
        act(() => {
            result.current.setAvatar("sushi");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            name: "Claudia",
            surname: "Cook",
            avatar: "sushi",
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("should set a required-fields error when the name is empty", async () => {
        const { result } = renderEditProfileForm(CURRENT_USER, jest.fn());

        act(() => {
            result.current.setName("");
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockedPatch).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Name and surname are required");
    });

    it("should set a generic error when the request fails", async () => {
        mockedPatch.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: "Boom" } },
            message: "Request failed",
        });
        const onSuccess = jest.fn();

        const { result } = renderEditProfileForm(CURRENT_USER, onSuccess);

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(result.current.error).toBe(
            "Something went wrong. Please try again.",
        );
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
