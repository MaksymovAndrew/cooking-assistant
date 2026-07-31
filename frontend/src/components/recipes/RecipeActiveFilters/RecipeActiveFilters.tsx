import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFilterParams } from "types/recipe";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { ActiveFilterChips } from "components/ui/ActiveFilterChips";

interface RecipeActiveFiltersProps {
    total: number;
    activeFilters: ActiveFilterEntry<RecipeFilterParams>[];
    hasActiveFilters: boolean;
    resetFilters: () => void;
}

export const RecipeActiveFilters: React.FC<RecipeActiveFiltersProps> = ({
    total,
    activeFilters,
    hasActiveFilters,
    resetFilters,
}) => {
    const { t } = useTranslation("recipes");

    const chips = activeFilters.flatMap((entry) => {
        if (!entry.def.chipLabel) {
            return [];
        }

        return [
            {
                key: entry.def.key,
                label: entry.def.chipLabel(entry.value, t),
                onRemove: entry.remove,
            },
        ];
    });

    return (
        <ActiveFilterChips
            countLabel={t("filterPanel.recipeCount", { count: total })}
            chips={chips}
            hasActiveFilters={hasActiveFilters}
            onClearAll={resetFilters}
            clearAllLabel={t("filterPanel.clearAll")}
            removeLabel={t("filterPanel.removeFilter")}
        />
    );
};
