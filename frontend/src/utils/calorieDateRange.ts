export interface PeriodRange {
    from: string;
    to: string;
}

const localMidnight = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

// not "now": an end fixed at mount drops entries logged later; a day-derived end shares one cache entry
const nextLocalMidnight = (todayKey: string): string => {
    const midnight = localMidnight(new Date(todayKey));

    midnight.setDate(midnight.getDate() + 1);

    return midnight.toISOString();
};

// todayKey is passed in so it is a real useMemo dependency, not a clock read exhaustive-deps can't see
export const getTodayRange = (
    todayKey: string = new Date().toDateString(),
): PeriodRange => ({
    from: localMidnight(new Date(todayKey)).toISOString(),
    to: nextLocalMidnight(todayKey),
});

export const getLastNDaysRange = (
    days: number,
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const start = localMidnight(new Date(todayKey));

    start.setDate(start.getDate() - (days - 1));

    return { from: start.toISOString(), to: nextLocalMidnight(todayKey) };
};
