import {
    filtersReducer,
    setMenuSelectedCategories,
} from "redux/slices/filtersSlice";

const initial = () => filtersReducer(undefined, { type: "@@INIT" });

describe("filtersSlice", () => {
    it("should start with empty menu filters", () => {
        expect(initial()).toEqual({
            menu: { selectedCategories: [] },
        });
    });

    it("should set the menu selected categories", () => {
        expect(
            filtersReducer(undefined, setMenuSelectedCategories([3, 4])).menu
                .selectedCategories,
        ).toEqual([3, 4]);
    });
});
