import { act } from "@testing-library/react";

import { RATING_TARGET } from "constants/ratings";
import type { RecordRating } from "types/rating";

import { API_ROUTES } from "api/endpoints";

import { useRatingControl } from "hooks/useRatingControl";

import { makeAxiosError, mockedDelete, mockedPut } from "test/apiClientMock";
import { renderHookWithStore } from "test/store";

jest.mock("api/client");

const RATED_BY_TWO: RecordRating = {
    ratingAverage: 4,
    ratingCount: 2,
    myRating: null,
};

describe("useRatingControl", () => {
    it("should start from the server values", () => {
        const { result } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.recipe, 5, RATED_BY_TWO),
        );

        expect(result.current).toMatchObject(RATED_BY_TWO);
        expect(result.current.isDisabled).toBe(false);
    });

    it("should send a first vote and count it into the average at once", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.recipe, 5, RATED_BY_TWO),
        );

        await act(async () => {
            await result.current.rate(1);
        });

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.recipes.rating(5), {
            value: 1,
        });
        expect(result.current).toMatchObject({
            ratingAverage: 3,
            ratingCount: 3,
            myRating: 1,
        });
    });

    it("should replace the viewer's own vote without counting it twice", async () => {
        mockedPut.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.menu, 9, {
                ratingAverage: 4,
                ratingCount: 2,
                myRating: 5,
            }),
        );

        await act(async () => {
            await result.current.rate(1);
        });

        expect(result.current).toMatchObject({
            ratingAverage: 2,
            ratingCount: 2,
            myRating: 1,
        });
    });

    it("should take the vote back and show no average once the last one is gone", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        const { result } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.menu, 9, {
                ratingAverage: 3,
                ratingCount: 1,
                myRating: 3,
            }),
        );

        await act(async () => {
            await result.current.clear();
        });

        expect(mockedDelete).toHaveBeenCalledWith(API_ROUTES.menu.rating(9), {
            data: undefined,
            params: undefined,
        });
        expect(result.current).toMatchObject({
            ratingAverage: null,
            ratingCount: 0,
            myRating: null,
        });
    });

    it("should roll back when the request fails", async () => {
        mockedPut.mockRejectedValue(makeAxiosError(500, "Server error"));
        const { result } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.recipe, 5, RATED_BY_TWO),
        );

        await act(async () => {
            await result.current.rate(5);
        });

        expect(result.current).toMatchObject(RATED_BY_TWO);
    });

    it("should follow new server values once they arrive", async () => {
        mockedPut.mockResolvedValue({ data: null });
        let server = RATED_BY_TWO;
        const { result, rerender } = renderHookWithStore(() =>
            useRatingControl(RATING_TARGET.recipe, 5, server),
        );

        await act(async () => {
            await result.current.rate(5);
        });
        server = { ratingAverage: 4.5, ratingCount: 4, myRating: 5 };
        rerender();

        expect(result.current).toMatchObject(server);
    });
});
