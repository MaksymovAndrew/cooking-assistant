import React from "react";

import type { Ingredient } from "types/ingredient";

import { AllergenDot } from "components/ui/AllergenDot";
import { HighlightedMatch } from "components/ui/HighlightedMatch";

import { resolveIngredientName, resolveUnit } from "utils/ingredientName";

import styles from "./AddIngredientModal.module.scss";

interface AddIngredientResultProps {
    ingredient: Ingredient;
    query: string;
    onSelect: (id: number) => void;
}

export const AddIngredientResult: React.FC<AddIngredientResultProps> = ({
    ingredient,
    query,
    onSelect,
}) => (
    <li>
        <button
            type="button"
            onClick={() => {
                onSelect(ingredient.id);
            }}
            className={styles["add-ingredient-modal__result"]}
        >
            <span>
                <HighlightedMatch
                    text={resolveIngredientName(ingredient)}
                    query={query}
                />
            </span>
            <span className={styles["add-ingredient-modal__result-unit"]}>
                {resolveUnit(ingredient.unit_name)}
            </span>
            <AllergenDot allergens={ingredient.allergens} />
        </button>
    </li>
);
