export const roundCalories = (calories: number): number => Math.round(calories);

// the fraction of a goal ring's circumference to draw - clamped at a full ring rather than drawn
// past 100%, so going further over the goal doesn't need a longer arc to read as "over"
export const calorieRingFraction = (consumed: number, goal: number): number =>
    goal > 0 ? Math.min(consumed / goal, 1) : 0;

// thousands-separated for display (e.g. "1,180") - same en-US locale already used for dates in dateUtils.ts
export const formatKcal = (calories: number): string =>
    calories.toLocaleString("en-US");

const COMPACT_KCAL_FORMATTER = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 0,
});

// abbreviated for tight spaces (e.g. "13k" instead of "13,333") - lowercased since Intl's compact
// suffix is uppercase ("13K") and the app's own kcal figures read lowercase everywhere else
export const formatKcalCompact = (calories: number): string =>
    COMPACT_KCAL_FORMATTER.format(calories).toLowerCase();

// rounds the per-portion value first, then multiplies by the portion count - keeps a
// multi-portion total a clean multiple of what's shown per portion, instead of drifting from
// independently rounding the scaled raw value (e.g. 22/portion * 2 must read 44, not 43)
export const scaleCaloriesForPortions = (
    caloriesPerPortion: number,
    portionCount: number,
): number => roundCalories(caloriesPerPortion) * portionCount;

// no goal/remaining or no calorie data on the recipe means "can't tell", not "over budget"
export const exceedsCalorieBudget = (
    caloriesPerPortion: number | null,
    goal: number | null,
    remaining: number | null,
): boolean => {
    const hasBudgetData = goal !== null && remaining !== null;

    if (!hasBudgetData || caloriesPerPortion === null) {
        return false;
    }

    return caloriesPerPortion > remaining;
};

// same as exceedsCalorieBudget, but for however many portions are actually selected (a recipe
// detail page scales per-portion calories by a stepper, unlike a list card which only ever shows one portion)
export const exceedsCalorieBudgetForPortions = (
    caloriesPerPortion: number | null,
    portionCount: number,
    goal: number | null,
    remaining: number | null,
): boolean =>
    caloriesPerPortion === null
        ? false
        : exceedsCalorieBudget(
              scaleCaloriesForPortions(caloriesPerPortion, portionCount),
              goal,
              remaining,
          );

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
