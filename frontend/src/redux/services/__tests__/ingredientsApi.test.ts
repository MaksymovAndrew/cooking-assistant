import type { Ingredient } from "types/ingredient";

import { API_ROUTES } from "api/endpoints";

import { ingredientsApi } from "redux/services/ingredientsApi";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const SAMPLE: Ingredient[] = [
    {
        id: 1,
        slug: "salt",
        name: "Salt",
        category: "spices",
        unit_name: "g",
        allergens: [],
        days_to_expire: 1825,
        calories_per_unit: null,
    },
];

describe("ingredientsApi", () => {
    it("should fetch the ingredient catalog", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE });
        const store = makeTestStore();

        const result = await store.dispatch(
            ingredientsApi.endpoints.getIngredients.initiate(null),
        );

        expect(mockedGet).toHaveBeenCalledWith(API_ROUTES.ingredients.list, {
            params: undefined,
        });
        expect(result.data).toEqual(SAMPLE);
    });
});
