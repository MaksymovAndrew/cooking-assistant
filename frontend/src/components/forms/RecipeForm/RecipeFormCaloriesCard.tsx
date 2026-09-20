import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipe";

import { FormCard } from "components/ui/FormCard";
import { FormField } from "components/ui/FormField";
import { NumberInput } from "components/ui/NumberInput";

import {
    formatKcal,
    roundCalories,
    sumIngredientCalories,
} from "utils/calories";

import styles from "./RecipeForm.module.scss";

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
    // so the field's hint matches what an empty override would actually compute to server-side
    const autoCalories = useMemo(
        () => sumIngredientCalories(ingredients),
        [ingredients],
    );

    return (
        <FormCard>
            <FormField
                htmlFor={id}
                label={t("recipeForm.caloriesOverrideLabel")}
            >
                <NumberInput
                    id={id}
                    min={0}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                />
                <p className={styles["recipe-form__calories-hint"]}>
                    {ingredients.length > 0
                        ? t("recipeForm.caloriesAutoHint", {
                              count: formatKcal(roundCalories(autoCalories)),
                          })
                        : t("recipeForm.caloriesAutoHintEmpty")}
                </p>
            </FormField>
        </FormCard>
    );
};
