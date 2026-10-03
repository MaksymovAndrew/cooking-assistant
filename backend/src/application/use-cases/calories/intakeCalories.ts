// rounded before multiplying, matching the frontend's scaleCaloriesForPortions
export function intakeCalories(perPortion: number, portions: number): number {
    return Math.round(perPortion) * portions;
}
