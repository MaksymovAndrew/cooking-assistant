import { extractPaginatedRows } from "infrastructure/persistence/pg/pagination";

describe("extractPaginatedRows", () => {
    it("should split rows into items without total_count and the total from the first row", () => {
        const rows = [
            { id: 1, title: "Tomato soup", total_count: 2 },
            { id: 2, title: "Pasta", total_count: 2 },
        ];

        const result = extractPaginatedRows(rows);

        expect(result).toEqual({
            items: [
                { id: 1, title: "Tomato soup" },
                { id: 2, title: "Pasta" },
            ],
            total: 2,
        });
    });

    it("should return an empty result when there are no rows", () => {
        const result = extractPaginatedRows([]);

        expect(result).toEqual({ items: [], total: 0 });
    });
});
