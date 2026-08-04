export interface DailyIntakeEntry {
    eaten_at: string;
    calories: number;
}

export interface DailyIntakeDay {
    date: string;
    consumed: number;
}

const PAD_WIDTH = 2;

const toLocalDateKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(PAD_WIDTH, "0")}-${String(date.getDate()).padStart(PAD_WIDTH, "0")}`;

// buckets the last `days` local calendar days (oldest first, today last), independent of how the
// entries are ordered or which timezone `eaten_at` was written in on the server. todayKey is
// threaded in explicitly (see utils/calorieDateRange.ts) rather than calling Date.now() only
// internally, so a caller memoizing on todayKey has a real dependency, not a hidden one
export const computeDailyIntake = (
    entries: readonly DailyIntakeEntry[],
    days: number,
    todayKey: string = new Date().toDateString(),
): DailyIntakeDay[] => {
    const today = new Date(todayKey);
    const buckets: DailyIntakeDay[] = [];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - offset,
        );

        buckets.push({ date: toLocalDateKey(date), consumed: 0 });
    }

    const byDate = new Map(buckets.map((bucket) => [bucket.date, bucket]));

    for (const entry of entries) {
        const bucket = byDate.get(toLocalDateKey(new Date(entry.eaten_at)));

        if (bucket) {
            bucket.consumed += entry.calories;
        }
    }

    return buckets;
};

// a day counts as "in budget" only once something was actually logged - an empty day (0 consumed)
// isn't a win, it's no data
export const isDayInBudget = (day: DailyIntakeDay, goal: number): boolean =>
    day.consumed > 0 && day.consumed <= goal;

// counts consecutive in-budget days ending yesterday, not today - today is still in progress, so
// including it would make the streak flicker back to 0 every morning before the first entry lands
export const computeStreak = (
    days: readonly DailyIntakeDay[],
    goal: number | null,
): number => {
    if (goal === null) {
        return 0;
    }

    let streak = 0;

    for (let i = days.length - 2; i >= 0; i -= 1) {
        if (isDayInBudget(days[i], goal)) {
            streak += 1;
        } else {
            break;
        }
    }

    return streak;
};

// longest in-budget run within the fetched window (not a lifetime record - bounded by the 7/30-day
// history query); excludes today for the same reason computeStreak does - today isn't over yet, so
// counting it here would let a still-in-progress day briefly claim a new best before it's earned
export const computeBestStreak = (
    days: readonly DailyIntakeDay[],
    goal: number | null,
): number => {
    if (goal === null) {
        return 0;
    }

    let best = 0;
    let current = 0;

    for (const day of days.slice(0, -1)) {
        if (isDayInBudget(day, goal)) {
            current += 1;
            best = Math.max(best, current);
        } else {
            current = 0;
        }
    }

    return best;
};
