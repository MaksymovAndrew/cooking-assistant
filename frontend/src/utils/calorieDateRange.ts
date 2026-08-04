export interface PeriodRange {
    from: string;
    to: string;
}

const localMidnight = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

// todayKey (from useTodayDateKey) anchors "from" - passing it explicitly, rather than reading Date.now() only internally, makes it a real useMemo dependency instead of a hidden one exhaustive-deps can't see
export const getTodayRange = (
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const midnight = localMidnight(new Date(todayKey));

    return { from: midnight.toISOString(), to: new Date().toISOString() };
};

// the last `days` local calendar days including today, oldest-first once grouped - used by the history chart
export const getLastNDaysRange = (
    days: number,
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const start = localMidnight(new Date(todayKey));

    start.setDate(start.getDate() - (days - 1));

    return { from: start.toISOString(), to: new Date().toISOString() };
};
