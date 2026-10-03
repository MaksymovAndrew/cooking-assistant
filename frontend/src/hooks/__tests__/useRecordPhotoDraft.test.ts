import { act } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { useRecordPhotoDraft } from "hooks/useRecordPhotoDraft";

import { mockedDelete, mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const STORED_KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";
const PHOTO = new File(["image"], "dish.png", { type: "image/png" });

const renderDraft = () =>
    renderHookWithStore(() => useRecordPhotoDraft("recipe"));

describe("useRecordPhotoDraft", () => {
    it("should upload a picked photo when committed", async () => {
        mockedPut.mockResolvedValue({ data: { photo_key: STORED_KEY } });
        const { result } = renderDraft();

        act(() => {
            result.current.choose(PHOTO);
        });
        await act(async () => {
            await result.current.commit(7);
        });

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.photo(7),
            PHOTO,
        );
    });

    it("should delete a removed stored photo when committed", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderDraft();

        act(() => {
            result.current.reset(STORED_KEY);
        });
        act(() => {
            result.current.remove();
        });

        expect(result.current.src).toBeNull();
        expect(result.current.isDirty).toBe(true);

        await act(async () => {
            await result.current.commit(7);
        });

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.recipes.photo(7), {
            data: undefined,
            params: undefined,
        });
    });
});
