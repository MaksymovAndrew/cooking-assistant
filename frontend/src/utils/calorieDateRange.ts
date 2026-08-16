export interface PeriodRange {
    from: string;
    to: string;
}

const localMidnight = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

// rounded UP (never down) so quantization can't exclude a just-logged entry from the range
const QUANTIZE_MS = 60_000;

const quantizedNow = (): string =>
    new Date(Math.ceil(Date.now() / QUANTIZE_MS) * QUANTIZE_MS).toISOString();

// todayKey (from useTodayDateKey) anchors "from" - passing it explicitly, rather than reading Date.now() only internally, makes it a real useMemo dependency instead of a hidden one exhaustive-deps can't see
export const getTodayRange = (
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const midnight = localMidnight(new Date(todayKey));

    return { from: midnight.toISOString(), to: quantizedNow() };
};

// the last `days` local calendar days including today, oldest-first once grouped - used by the history chart
export const getLastNDaysRange = (
    days: number,
    todayKey: string = new Date().toDateString(),
): PeriodRange => {
    const start = localMidnight(new Date(todayKey));

    start.setDate(start.getDate() - (days - 1));

    return { from: start.toISOString(), to: quantizedNow() };
};
