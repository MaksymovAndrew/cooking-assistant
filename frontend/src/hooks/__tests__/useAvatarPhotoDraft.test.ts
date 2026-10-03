import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useAvatarPhotoDraft } from "hooks/useAvatarPhotoDraft";

import { mockedDelete } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const STORED_KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";

describe("useAvatarPhotoDraft", () => {
    it("should delete the stored photo when it was removed", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useAvatarPhotoDraft(STORED_KEY),
        );

        act(() => {
            result.current.remove();
        });
        await act(async () => {
            await result.current.commit();
        });

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.auth.avatar, {
            data: undefined,
            params: undefined,
        });
    });
});
