export type QueryParam = string | number | boolean | number[] | null;

// escapes LIKE/ILIKE wildcards in user input so a literal "%"/"_" in a search term is
// matched literally instead of being treated as a pattern wildcard (backslash is
// Postgres's default LIKE escape character, so no explicit ESCAPE clause is needed)
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

// bind() pushes the value and hands back its placeholder, so indices can never drift out of sync with the params array
export class SqlFilterBuilder {
    private readonly conditions: string[] = [];
    private readonly params: QueryParam[] = [];

    constructor(seedCondition?: string, seedParams: QueryParam[] = []) {
        if (seedCondition) {
            this.conditions.push(seedCondition);
        }
        this.params.push(...seedParams);
    }

    add(build: (bind: (value: QueryParam) => string) => string): void {
        const bind = (value: QueryParam): string => {
            this.params.push(value);

            return `$${this.params.length}`;
        };

        this.conditions.push(build(bind));
    }

    whereClause(): string {
        return this.conditions.length > 0
            ? ` WHERE ${this.conditions.join(" AND ")}`
            : "";
    }

    bindTail(...values: QueryParam[]): string[] {
        return values.map((value) => {
            this.params.push(value);

            return `$${this.params.length}`;
        });
    }

    values(): QueryParam[] {
        return this.params;
    }
}
