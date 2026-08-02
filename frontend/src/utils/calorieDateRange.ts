export interface PeriodRange {
    from: string;
    to: string;
}

const localMidnight = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

// local-timezone "today" (the server has no notion of the user's day) - starts at local midnight, "to" is right now
export const getTodayRange = (): PeriodRange => {
    const now = new Date();

    return { from: localMidnight(now).toISOString(), to: now.toISOString() };
};

// the last `days` local calendar days including today, oldest-first once grouped - used by the history chart
export const getLastNDaysRange = (days: number): PeriodRange => {
    const now = new Date();
    const start = localMidnight(now);

    start.setDate(start.getDate() - (days - 1));

    return { from: start.toISOString(), to: now.toISOString() };
};
