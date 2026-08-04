import { useCalorieBudget } from "hooks/useCalorieBudget";

import { exceedsCalorieBudgetForPortions } from "utils/calories";

// single-item convenience wrapper around useCalorieBudget() for detail pages that render just
// one hero stat (recipe/menu) - list pages compute the budget once and check many items against
// it directly instead, so they call useCalorieBudget()/exceedsCalorieBudget() themselves
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
