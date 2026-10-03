import { formatNumber } from "utils/intlFormat";
import { sumBy } from "utils/sum";

export const roundCalories = (calories: number): number => Math.round(calories);

// clamped at a full ring: going further over needs no longer arc to read as "over"
export const calorieRingFraction = (consumed: number, goal: number): number =>
    goal > 0 ? Math.min(consumed / goal, 1) : 0;

export const formatKcal = (calories: number, locale: string): string =>
    formatNumber(calories, locale);

const COMPACT_KCAL_OPTIONS: Intl.NumberFormatOptions = {
    notation: "compact",
    maximumFractionDigits: 0,
};

// lowercased: Intl's compact suffix reads "13K", while the app's kcal figures read lowercase
export const formatKcalCompact = (calories: number, locale: string): string =>
    formatNumber(calories, locale, COMPACT_KCAL_OPTIONS).toLowerCase();

// rounded first, so the total stays a multiple of the per-portion figure shown
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

// mirrors the backend's SQL SUM, where a NULL term drops out instead of nulling the total
export const sumIngredientCalories = (
    ingredients: readonly CalorieIngredient[],
): number =>
    sumBy(
        ingredients,
        (ingredient) =>
            (ingredient.calories_per_unit ?? 0) * ingredient.quantity,
    );
