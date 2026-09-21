import { MAX_RATING } from "constants/ratings";

const STEP_BY_KEY: Record<string, number> = {
    ArrowRight: 1,
    ArrowUp: 1,
    ArrowLeft: -1,
    ArrowDown: -1,
};

// the star a key moves focus to from `current`, or null for a key the stars don't handle
export const starKeyTarget = (key: string, current: number): number | null => {
    if (key === "Home") {
        return 1;
    }

    if (key === "End") {
        return MAX_RATING;
    }

    const step = STEP_BY_KEY[key] ?? 0;

    return step === 0
        ? null
        : Math.min(Math.max(current + step, 1), MAX_RATING);
};
