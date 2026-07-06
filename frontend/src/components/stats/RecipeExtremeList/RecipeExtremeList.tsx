import React from "react";

import type { RecipeWithIngredientNames } from "types/recipe";

import styles from "./RecipeExtremeList.module.scss";

interface RecipeExtremeListProps {
    label: string;
    recipes: RecipeWithIngredientNames[];
    unit: string;
    getValue: (r: RecipeWithIngredientNames) => string | number;
}

export const RecipeExtremeList: React.FC<RecipeExtremeListProps> = ({
    label,
    recipes,
    unit,
    getValue,
}) => (
    <div className={styles["recipe-extreme-list"]}>
        <p className={styles["recipe-extreme-list__label"]}>{label}</p>
        <ul className={styles["recipe-extreme-list__items"]}>
            {recipes.map((recipe) => (
                <li
                    key={recipe.id}
                    className={styles["recipe-extreme-list__row"]}
                >
                    <span>{recipe.title}</span>
                    <span className={styles["recipe-extreme-list__value"]}>
                        {getValue(recipe)}
                        {unit}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);
