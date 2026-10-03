import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipeForm";

import { useLocale } from "hooks/useLocale";

import { FormCard } from "components/ui/FormCard";
import { FormField } from "components/ui/FormField";
import { NumberInput } from "components/ui/NumberInput";

import {
    formatKcal,
    roundCalories,
    sumIngredientCalories,
} from "utils/calories";

interface RecipeFormCaloriesCardProps {
    id: string;
    value: string;
    ingredients: RecipeFormIngredient[];
    onChange: (value: string) => void;
}

export const RecipeFormCaloriesCard: React.FC<RecipeFormCaloriesCardProps> = ({
    id,
    value,
    ingredients,
    onChange,
}) => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    // mirrors the server's sum, so the hint shows what an empty override computes to
    const autoCalories = useMemo(
        () => sumIngredientCalories(ingredients),
        [ingredients],
    );

    const hint =
        ingredients.length > 0
            ? t("recipeForm.caloriesAutoHint", {
                  count: formatKcal(roundCalories(autoCalories), locale),
              })
            : t("recipeForm.caloriesAutoHintEmpty");

    return (
        <FormCard>
            <FormField
                htmlFor={id}
                label={t("recipeForm.caloriesOverrideLabel")}
                hint={hint}
            >
                <NumberInput
                    id={id}
                    min={0}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                />
            </FormField>
        </FormCard>
    );
};
