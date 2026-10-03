import { useTranslation } from "react-i18next";

import { useGetRecipeTypesQuery } from "redux/services/recipeTypesApi";

import { recipeTypeName } from "utils/referenceLabels";

export const useSelectedRecipeTypes = (selectedIds: number[]) => {
    const { t } = useTranslation();
    const hasSelectedTypes = selectedIds.length > 0;
    const { data: types = [] } = useGetRecipeTypesQuery(
        hasSelectedTypes ? { ids: selectedIds.join(",") } : null,
        { skip: !hasSelectedTypes },
    );
    const descriptions = types.filter((type) => selectedIds.includes(type.id));
    const typesHeader = descriptions
        .map((type) => recipeTypeName(t, type.type_name))
        .join(", ");

    return { descriptions, typesHeader };
};
