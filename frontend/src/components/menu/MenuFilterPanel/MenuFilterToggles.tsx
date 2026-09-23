import { ArrowDownWideNarrow, Heart, Star } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { SetFilterValue } from "hooks/useListFilters";

import { FilterToggle } from "components/ui/FilterToggle";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";

interface MenuFilterTogglesProps {
    filters: MenuFilterState;
    setValue: SetFilterValue<MenuFilterState>;
    // favourites need a signed-in viewer; the rating toggles are open to guests
    canFavourite: boolean;
}

export const MenuFilterToggles: React.FC<MenuFilterTogglesProps> = ({
    filters,
    setValue,
    canFavourite,
}) => {
    const { t } = useTranslation("menu");

    return (
        <>
            {canFavourite && (
                <FilterToggle
                    icon={Heart}
                    label={t("categoryFilter.favouritesLabel")}
                    checked={filters.favourites}
                    onChange={(value) => {
                        setValue("favourites", value);
                    }}
                />
            )}
            <FilterToggle
                icon={Star}
                label={t("categoryFilter.topRatedLabel")}
                checked={filters.topRated}
                onChange={(value) => {
                    setValue("topRated", value);
                }}
            />
            <FilterToggle
                icon={ArrowDownWideNarrow}
                label={t("categoryFilter.sortByRatingLabel")}
                checked={filters.sort === "rating"}
                onChange={(value) => {
                    setValue("sort", value ? "rating" : null);
                }}
            />
        </>
    );
};
