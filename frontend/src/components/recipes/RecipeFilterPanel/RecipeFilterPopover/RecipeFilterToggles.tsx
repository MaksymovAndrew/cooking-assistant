import { Ban, Heart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import type { SetFilterValue } from "hooks/useListFilters";

import { BasketMark } from "components/icons";
import { FilterToggle } from "components/ui/FilterToggle";

import type { RecipeFilterState } from "utils/filters/recipeFilterDefs";

interface RecipeFilterTogglesProps {
    filters: RecipeFilterState;
    setValue: SetFilterValue<RecipeFilterState>;
}

// the per-viewer filters: each needs a session, so none is offered to a guest
export const RecipeFilterToggles: React.FC<RecipeFilterTogglesProps> = ({
    filters,
    setValue,
}) => {
    const { t } = useTranslation("recipes");
    const { canUsePantry, canFavourite, canAvoid } = useAppSelector(
        selectViewerCapabilities,
    );

    return (
        <>
            {canUsePantry && (
                <FilterToggle
                    icon={BasketMark}
                    label={t("filterPanel.inPantryLabel")}
                    checked={filters.inPantry}
                    onChange={(value) => {
                        setValue("inPantry", value);
                    }}
                />
            )}
            {canFavourite && (
                <FilterToggle
                    icon={Heart}
                    label={t("filterPanel.favouritesLabel")}
                    checked={filters.favourites}
                    onChange={(value) => {
                        setValue("favourites", value);
                    }}
                />
            )}
            {canAvoid && (
                <FilterToggle
                    icon={Ban}
                    label={t("filterPanel.hideAvoidedLabel")}
                    checked={filters.hideAvoided}
                    onChange={(value) => {
                        setValue("hideAvoided", value);
                    }}
                />
            )}
        </>
    );
};
