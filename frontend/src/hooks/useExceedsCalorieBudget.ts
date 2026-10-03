import { useCalorieBudget } from "hooks/useCalorieBudget";

import { exceedsCalorieBudgetForPortions } from "utils/calories";

// for a single item; a list calls useCalorieBudget() once and checks every item itself
export const useExceedsCalorieBudget = (
    caloriesPerPortion: number | null,
    portionCount = 1,
): boolean => {
    const { goal, remaining } = useCalorieBudget();

    return exceedsCalorieBudgetForPortions(
        caloriesPerPortion,
        portionCount,
        goal,
        remaining,
    );
};
