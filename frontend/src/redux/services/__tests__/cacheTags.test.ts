import {
    infiniteListProvidesTags,
    listProvidesTags,
} from "redux/services/cacheTags";

describe("listProvidesTags", () => {
    it("should tag every row by id plus a shared LIST tag", () => {
        const tags = listProvidesTags("Recipe", [{ id: 1 }, { id: 2 }]);

        expect(tags).toEqual([
            { type: "Recipe", id: 1 },
            { type: "Recipe", id: 2 },
            { type: "Recipe", id: "LIST" },
        ]);
    });

    it("should fall back to only the LIST tag when there is no result", () => {
        expect(listProvidesTags("Recipe", undefined)).toEqual([
            { type: "Recipe", id: "LIST" },
        ]);
    });
});

describe("infiniteListProvidesTags", () => {
    it("should tag every row across all pages plus a shared LIST tag", () => {
        const result = {
            pages: [
                { items: [{ id: 1 }], total: 2 },
                { items: [{ id: 2 }], total: 2 },
            ],
            pageParams: [0, 1],
        };

        expect(infiniteListProvidesTags("Recipe", result)).toEqual([
            { type: "Recipe", id: 1 },
            { type: "Recipe", id: 2 },
            { type: "Recipe", id: "LIST" },
        ]);
    });

    it("should fall back to only the LIST tag when there is no result", () => {
        expect(infiniteListProvidesTags("Recipe", undefined)).toEqual([
            { type: "Recipe", id: "LIST" },
        ]);
    });
});
