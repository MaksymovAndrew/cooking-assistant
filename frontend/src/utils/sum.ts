export const sumBy = <T>(
    items: readonly T[],
    valueOf: (item: T) => number,
): number => items.reduce((total, item) => total + valueOf(item), 0);
