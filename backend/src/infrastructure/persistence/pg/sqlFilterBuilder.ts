export type QueryParam = string | number | boolean | number[] | string[] | null;

// backslash is Postgres's default LIKE escape, so no ESCAPE clause is needed
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

// bind() hands back the placeholder it pushed, so indices can't drift from the params
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
