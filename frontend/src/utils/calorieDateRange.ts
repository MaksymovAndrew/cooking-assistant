export interface PeriodRange {
    from: string;
    to: string;
}

const localMidnight = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

// the range ends at the next local midnight, not "now": the server stamps an entry when it is logged, so an end
// fixed at mount would drop anything logged later, and a value derived from the day key alone lets every caller
// share one RTK Query cache entry
const nextLocalMidnight = (todayKey: string): string => {
    const midnight = localMidnight(new Date(todayKey));

    midnight.setDate(midnight.getDate() + 1);

    return midnight.toISOString();
};

// todayKey (from useTodayDateKey) anchors the range - passing it explicitly, rather than reading the clock internally, makes it a real useMemo dependency instead of a hidden one exhaustive-deps can't see
export const getTodayRange = (
    todayKey: string = new Date().toDateString(),
): PeriodRange => ({
    from: localMidnight(new Date(todayKey)).toISOString(),
    to: nextLocalMidnight(todayKey),
});

// the last `days` local calendar days including today, oldest-first once grouped - used by the history chart
export const getLastNDaysRange = (
    days: number,
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const start = localMidnight(new Date(todayKey));

    start.setDate(start.getDate() - (days - 1));

    return { from: start.toISOString(), to: nextLocalMidnight(todayKey) };
};
