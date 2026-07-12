export const findMostUsed = <T>(
    stats: T[],
    getCount: (stat: T) => number,
): T | null =>
    stats.reduce<T | null>(
        (best, stat) =>
            !best || getCount(stat) > getCount(best) ? stat : best,
        null,
    );

// shared by "cooking time by recipe type" and "total time by menu category"
export const averageByGroup = <T>(
    items: T[],
    getGroup: (item: T) => string,
    getValue: (item: T) => number,
): { group: string; average: number }[] => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    items.forEach((item) => {
        const group = getGroup(item);

        sums[group] = (sums[group] || 0) + getValue(item);
        counts[group] = (counts[group] || 0) + 1;
    });

    return Object.keys(sums).map((group) => ({
        group,
        average: Math.round(sums[group] / counts[group]),
    }));
};

const EXTREMES_LIMIT = 3;

// shared by recipe and menu extremes: always the top three from each end, not just the items tied with the single min/max value
export const findExtremes = <T>(
    items: T[],
    getValue: (item: T) => number,
): { min: T[]; max: T[] } => {
    const sorted = [...items].sort((a, b) => getValue(a) - getValue(b));

    return {
        min: sorted.slice(0, EXTREMES_LIMIT),
        max: sorted.slice(-EXTREMES_LIMIT).reverse(),
    };
};
