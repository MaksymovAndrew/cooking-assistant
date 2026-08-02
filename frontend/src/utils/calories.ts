export const roundCalories = (calories: number): number => Math.round(calories);

// the fraction of a goal ring's circumference to draw - clamped at a full ring rather than drawn
// past 100%, so going further over the goal doesn't need a longer arc to read as "over"
export const calorieRingFraction = (consumed: number, goal: number): number =>
    goal > 0 ? Math.min(consumed / goal, 1) : 0;

// thousands-separated for display (e.g. "1,180") - same en-US locale already used for dates in dateUtils.ts
export const formatKcal = (calories: number): string =>
    calories.toLocaleString("en-US");

// rounds the per-portion value first, then multiplies by the portion count - keeps a
// multi-portion total a clean multiple of what's shown per portion, instead of drifting from
// independently rounding the scaled raw value (e.g. 22/portion * 2 must read 44, not 43)
export const scaleCaloriesForPortions = (
    caloriesPerPortion: number,
    portionCount: number,
): number => roundCalories(caloriesPerPortion) * portionCount;

export interface CalorieIngredient {
    quantity: number;
    calories_per_unit: number | null;
}

// mirrors the backend's SUM(quantity * calories_per_unit) (PgRecipeRepository.mutations.ts) -
// an ingredient without a catalog calorie value contributes nothing, the same way a NULL term
// drops out of a SQL SUM instead of nulling out the whole total
export const sumIngredientCalories = (
    ingredients: readonly CalorieIngredient[],
): number =>
    ingredients.reduce(
        (total, ingredient) =>
            total + (ingredient.calories_per_unit ?? 0) * ingredient.quantity,
        0,
    );
