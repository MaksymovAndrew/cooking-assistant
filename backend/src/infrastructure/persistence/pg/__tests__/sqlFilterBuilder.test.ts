import {
    escapeLikePattern,
    SqlFilterBuilder,
} from "infrastructure/persistence/pg/sqlFilterBuilder";

describe("SqlFilterBuilder", () => {
    it("should produce an empty where clause when nothing was added", () => {
        const builder = new SqlFilterBuilder();

        expect(builder.whereClause()).toBe("");
        expect(builder.values()).toEqual([]);
    });

    it("should seed a where clause from the constructor without an index", () => {
        const builder = new SqlFilterBuilder("r.person_id = $1", [7]);

        expect(builder.whereClause()).toBe(" WHERE r.person_id = $1");
        expect(builder.values()).toEqual([7]);
    });

    it("should join multiple added conditions with AND", () => {
        const builder = new SqlFilterBuilder();

        builder.add((bind) => `r.type_id = ANY(${bind([1, 2])}::int[])`);
        builder.add((bind) => `r.cooking_time >= ${bind(10)}`);

        expect(builder.whereClause()).toBe(
            " WHERE r.type_id = ANY($1::int[]) AND r.cooking_time >= $2",
        );
        expect(builder.values()).toEqual([[1, 2], 10]);
    });

    it("should number bound placeholders starting after the seed params", () => {
        const builder = new SqlFilterBuilder("r.person_id = $1", [7]);

        builder.add((bind) => `r.type_id = ANY(${bind([1, 2])}::int[])`);

        expect(builder.whereClause()).toBe(
            " WHERE r.person_id = $1 AND r.type_id = ANY($2::int[])",
        );
        expect(builder.values()).toEqual([7, [1, 2]]);
    });

    it("should let a single add() bind more than one placeholder", () => {
        const builder = new SqlFilterBuilder();

        builder.add(
            (bind) =>
                `r.creation_date BETWEEN ${bind("2026-01-01")} AND ${bind("2026-01-31")}`,
        );

        expect(builder.whereClause()).toBe(
            " WHERE r.creation_date BETWEEN $1 AND $2",
        );
        expect(builder.values()).toEqual(["2026-01-01", "2026-01-31"]);
    });

    it("should continue numbering from bindTail after added conditions", () => {
        const builder = new SqlFilterBuilder();

        builder.add((bind) => `r.cooking_time >= ${bind(10)}`);
        const [limitPlaceholder, offsetPlaceholder] = builder.bindTail(20, 0);

        expect(limitPlaceholder).toBe("$2");
        expect(offsetPlaceholder).toBe("$3");
        expect(builder.values()).toEqual([10, 20, 0]);
    });
});

describe("escapeLikePattern", () => {
    it("should escape LIKE wildcards so they match literally", () => {
        expect(escapeLikePattern("50%")).toBe("50\\%");
        expect(escapeLikePattern("mac_n_cheese")).toBe("mac\\_n\\_cheese");
    });

    it("should escape a literal backslash before wildcard-escaping runs into it", () => {
        expect(escapeLikePattern("a\\b")).toBe("a\\\\b");
    });

    it("should leave plain text untouched", () => {
        expect(escapeLikePattern("borscht")).toBe("borscht");
    });
});
