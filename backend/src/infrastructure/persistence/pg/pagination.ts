import type { PaginatedResult } from "domain/repositories/pagination.types";

export function extractPaginatedRows<T extends { total_count: number }>(
    rows: T[],
): PaginatedResult<Omit<T, "total_count">> {
    const total = rows[0]?.total_count ?? 0;
    const items = rows.map(({ total_count, ...item }) => item);

    return { items, total };
}
