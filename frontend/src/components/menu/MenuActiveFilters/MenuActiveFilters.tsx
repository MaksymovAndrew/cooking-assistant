import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuListParams } from "types/menu";

import type { ActiveFilterEntry } from "hooks/useListFilters";

import { ActiveFilterChips } from "components/ui/ActiveFilterChips";

interface MenuActiveFiltersProps {
    total: number;
    activeFilters: ActiveFilterEntry<MenuListParams>[];
    hasActiveFilters: boolean;
    resetFilters: () => void;
}

export const MenuActiveFilters: React.FC<MenuActiveFiltersProps> = ({
    total,
    activeFilters,
    hasActiveFilters,
    resetFilters,
}) => {
    const { t } = useTranslation("menu");

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
            countLabel={t("categoryFilter.menuCount", { count: total })}
            chips={chips}
            hasActiveFilters={hasActiveFilters}
            onClearAll={resetFilters}
            clearAllLabel={t("categoryFilter.reset")}
            removeLabel={t("categoryFilter.removeFilter")}
        />
    );
};
