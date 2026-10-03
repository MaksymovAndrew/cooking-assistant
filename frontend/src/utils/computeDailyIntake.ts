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

// local days, whatever timezone eaten_at was written in; todayKey keeps a memo dependency honest
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

// an empty day is no data, not a win
export const isDayInBudget = (day: DailyIntakeDay, goal: number): boolean =>
    day.consumed > 0 && day.consumed <= goal;

// ends yesterday: today is in progress and would reset the streak every morning
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

// within the fetched window only, and without today, which isn't over yet
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
