import { act } from "@testing-library/react";

import { FAVOURITE_TARGET } from "constants/favourites";

import { API_ROUTES } from "api/endpoints";

import { useFavouriteToggle } from "hooks/useFavouriteToggle";

import { makeAxiosError, mockedDelete, mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

describe("useFavouriteToggle", () => {
    it("should start from the server value", () => {
        const { result } = renderHookWithStore(() =>
            useFavouriteToggle(FAVOURITE_TARGET.recipe, 5, true),
        );

        expect(result.current.isFavourite).toBe(true);
        expect(result.current.isDisabled).toBe(false);
    });

    it("should favourite the recipe on the server and show it as favourited", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useFavouriteToggle(FAVOURITE_TARGET.recipe, 5, false),
        );

        await act(async () => {
            await result.current.toggle();
        });

        expect(result.current.isFavourite).toBe(true);
        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.favourite(5),
            undefined,
        );
    });

    it("should unfavourite a menu on the server", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useFavouriteToggle(FAVOURITE_TARGET.menu, 9, true),
        );

        await act(async () => {
            await result.current.toggle();
        });

        expect(result.current.isFavourite).toBe(false);
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.menu.favourite(9),
            {
                data: undefined,
                params: undefined,
            },
        );
    });

    it("should flip back when the request fails", async () => {
        mockedPut.mockRejectedValue(makeAxiosError(500, "Server error"));
        const { result } = renderHookWithStore(() =>
            useFavouriteToggle(FAVOURITE_TARGET.recipe, 5, false),
        );

        await act(async () => {
            await result.current.toggle();
        });

        expect(result.current.isFavourite).toBe(false);
    });

    it("should follow a new server value once one arrives", async () => {
        mockedPut.mockResolvedValue({ data: null });
        let serverValue = false;
        const { result, rerender } = renderHookWithStore(() =>
            useFavouriteToggle(FAVOURITE_TARGET.recipe, 5, serverValue),
        );

        await act(async () => {
            await result.current.toggle();
        });
        serverValue = true;
        rerender();

        expect(result.current.isFavourite).toBe(true);

        serverValue = false;
        rerender();

        expect(result.current.isFavourite).toBe(false);
    });
});
