// round the per-portion value first, then multiply - matches the frontend's scaleCaloriesForPortions
export function intakeCalories(perPortion: number, portions: number): number {
    return Math.round(perPortion) * portions;
}
