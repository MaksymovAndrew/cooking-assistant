import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipe";

import { NumberInput } from "components/ui/NumberInput";

import styles from "./SelectedIngredientsList.module.scss";

interface SelectedIngredientsListProps {
    ingredients: RecipeFormIngredient[];
    heading: string;
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (ingredient: RecipeFormIngredient) => void;
}

const REMOVE_ICON_SIZE = 15;

export const SelectedIngredientsList: React.FC<
    SelectedIngredientsListProps
> = ({ ingredients, heading, onQuantityChange, onRemove }) => {
    const { t } = useTranslation();

    return (
        <div className={styles["selected-ingredients-list"]}>
            <h4 className={styles["selected-ingredients-list__heading"]}>
                {heading}
            </h4>
            {ingredients.map((ingredient) => (
                <div
                    key={ingredient.id}
                    className={styles["selected-ingredients-list__row"]}
                >
                    <span className={styles["selected-ingredients-list__name"]}>
                        {ingredient.name}
                    </span>
                    <NumberInput
                        min={1}
                        value={ingredient.quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);

                            if (!isNaN(value)) {
                                onQuantityChange(ingredient.id, value);
                            }
                        }}
                        className={
                            styles["selected-ingredients-list__quantity"]
                        }
                    />
                    <span className={styles["selected-ingredients-list__unit"]}>
                        {ingredient.unit_name}
                    </span>
                    <button
                        type="button"
                        aria-label={t("chip.remove")}
                        onClick={() => {
                            onRemove(ingredient);
                        }}
                        className={styles["selected-ingredients-list__remove"]}
                    >
                        <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                    </button>
                </div>
            ))}
        </div>
    );
};
