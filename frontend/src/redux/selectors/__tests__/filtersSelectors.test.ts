import { selectMenuFilters } from "redux/selectors/filtersSelectors";
import { setMenuSelectedCategories } from "redux/slices/filtersSlice";

import { makeTestStore } from "test/store";

describe("filtersSelectors", () => {
    it("should select the menu filters", () => {
        const store = makeTestStore();

        store.dispatch(setMenuSelectedCategories([5]));

        expect(selectMenuFilters(store.getState()).selectedCategories).toEqual([
            5,
        ]);
    });
});
