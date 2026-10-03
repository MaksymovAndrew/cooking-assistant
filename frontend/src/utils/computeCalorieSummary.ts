import { sumBy } from "utils/sum";

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

export const computeCalorieSummary = (
    entries: readonly CalorieSummaryEntry[],
    goal: number | null,
): CalorieSummary => {
    const consumed = sumBy(entries, (entry) => entry.calories);

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
