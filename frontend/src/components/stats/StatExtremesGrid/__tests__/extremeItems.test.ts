import { extremeItems } from "components/stats/StatExtremesGrid";

const records = [
    { id: 1, title: "Soup", minutes: 10 },
    { id: 2, title: "Salad", minutes: 20 },
    { id: 3, title: "Stew", minutes: 30 },
    { id: 4, title: "Roast", minutes: 40 },
];

const value = (record: { minutes: number }) => `${record.minutes} min`;
const href = (id: number) => `/recipe/${id}`;

describe("extremeItems", () => {
    it("should keep only the first three records", () => {
        expect(extremeItems(records, value, href)).toHaveLength(3);
    });

    it("should map each record to a linked row with its formatted value", () => {
        expect(extremeItems(records, value, href)[0]).toEqual({
            key: 1,
            name: "Soup",
            value: "10 min",
            href: "/recipe/1",
        });
    });

    it("should return an empty list for no records", () => {
        expect(extremeItems([], value, href)).toEqual([]);
    });
});
