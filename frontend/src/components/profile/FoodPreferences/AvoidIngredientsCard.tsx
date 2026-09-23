import { Check, Leaf } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { FormCard } from "components/ui/FormCard";

import { AvoidedIngredientChips } from "./AvoidedIngredientChips";
import { AvoidIngredientSearch } from "./AvoidIngredientSearch";
import styles from "./FoodPreferences.module.scss";

interface AvoidIngredientsCardProps {
    catalog: Ingredient[];
    ingredientIds: number[];
    avoidedIngredients: Ingredient[];
    isDisabled: boolean;
    isSavedVisible: boolean;
    onToggle: (ingredient: Ingredient) => void;
}

const TITLE_ICON_SIZE = 18;
const SAVED_ICON_SIZE = 15;

export const AvoidIngredientsCard: React.FC<AvoidIngredientsCardProps> = ({
    catalog,
    ingredientIds,
    avoidedIngredients,
    isDisabled,
    isSavedVisible,
    onToggle,
}) => {
    const { t } = useTranslation("dietPreferences");

    return (
        <FormCard className={styles["food-preferences__card"]}>
            <div className={styles["food-preferences__card-head"]}>
                <Leaf size={TITLE_ICON_SIZE} aria-hidden="true" />
                <h3 className={styles["food-preferences__card-title"]}>
                    {t("ingredients.title")}
                </h3>
                <span className={styles["food-preferences__counter"]}>
                    {ingredientIds.length}
                </span>
            </div>
            <p className={styles["food-preferences__helper"]}>
                {t("ingredients.helper")}
            </p>
            <AvoidIngredientSearch
                catalog={catalog}
                ingredientIds={ingredientIds}
                isDisabled={isDisabled}
                onSelect={onToggle}
            />
            <AvoidedIngredientChips
                ingredients={avoidedIngredients}
                isDisabled={isDisabled}
                onRemove={onToggle}
            />
            <p
                role="status"
                className={[
                    styles["food-preferences__saved"],
                    isSavedVisible &&
                        styles["food-preferences__saved--visible"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <Check size={SAVED_ICON_SIZE} aria-hidden="true" />
                {isSavedVisible && t("ingredients.saved")}
            </p>
        </FormCard>
    );
};
