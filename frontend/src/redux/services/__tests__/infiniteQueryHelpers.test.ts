import {
    flattenPages,
    getNextOffsetParam,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";

describe("getNextOffsetParam", () => {
    it("should return the next offset when more rows remain", () => {
        const lastPage = { items: [{ id: 1 }], total: 2 };

        expect(getNextOffsetParam(lastPage, [lastPage])).toBe(1);
    });

    it("should return undefined when every row has been loaded", () => {
        const lastPage = { items: [{ id: 1 }], total: 1 };

        expect(getNextOffsetParam(lastPage, [lastPage])).toBeUndefined();
    });
});

describe("flattenPages", () => {
    it("should flatten every page's items into one list", () => {
        const data = {
            pages: [
                { items: [{ id: 1 }], total: 2 },
                { items: [{ id: 2 }], total: 2 },
            ],
            pageParams: [0, 1],
        };

        expect(flattenPages(data)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should return an empty list when there is no data", () => {
        expect(flattenPages(undefined)).toEqual([]);
    });
});

describe("getPaginatedTotal", () => {
    it("should return the total reported by the most recently fetched page", () => {
        const data = {
            pages: [
                { items: [{ id: 1 }], total: 1 },
                { items: [{ id: 2 }], total: 2 },
            ],
            pageParams: [0, 1],
        };

        expect(getPaginatedTotal(data)).toBe(2);
    });

    it("should return 0 when there is no data", () => {
        expect(getPaginatedTotal(undefined)).toBe(0);
    });
});
