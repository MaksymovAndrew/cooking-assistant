export type CalorieTone = "normal" | "near" | "over";

const NEAR_LIMIT_THRESHOLD = 0.85;

export interface CalorieSummaryEntry {
    calories: number;
}

export interface CalorieSummary {
    consumed: number;
    remaining: number | null;
    percent: number | null;
    isOverLimit: boolean;
    isNearLimit: boolean;
}

// null goal means "no goal set" - consumed is still meaningful (e.g. for a plain "kcal today" stat), everything goal-relative is not
export const computeCalorieSummary = (
    entries: readonly CalorieSummaryEntry[],
    goal: number | null,
): CalorieSummary => {
    const consumed = entries.reduce((sum, entry) => sum + entry.calories, 0);

    if (goal === null) {
        return {
            consumed,
            remaining: null,
            percent: null,
            isOverLimit: false,
            isNearLimit: false,
        };
    }

    const percent = goal > 0 ? consumed / goal : 0;

    return {
        consumed,
        remaining: goal - consumed,
        percent,
        isOverLimit: consumed > goal,
        isNearLimit: percent >= NEAR_LIMIT_THRESHOLD,
    };
};

export const calorieToneFor = (
    summary: Pick<CalorieSummary, "isOverLimit" | "isNearLimit">,
): CalorieTone => {
    if (summary.isOverLimit) {
        return "over";
    }

    return summary.isNearLimit ? "near" : "normal";
};
