import React from "react";

import type { RecipeSearchResultItem } from "types/recipe";

import { RecipeCard } from "components/cards/RecipeCard";

import { exceedsCalorieBudget } from "utils/calories";

import styles from "./RecipeListView.module.scss";

interface RecipeListGridProps {
    recipes: RecipeSearchResultItem[];
    calorieGoal: number | null;
    calorieRemaining: number | null;
    mine: boolean;
    currentUserId: number | null;
}

export const RecipeListGrid: React.FC<RecipeListGridProps> = ({
    recipes,
    calorieGoal,
    calorieRemaining,
    mine,
    currentUserId,
}) => (
    <div className={styles["recipe-list-view__grid"]}>
        {recipes.map((recipe) => (
            <RecipeCard
                key={recipe.id}
                recipe={recipe}
                mine={
                    mine ||
                    (typeof recipe.person_id === "number" &&
                        recipe.person_id === currentUserId)
                }
                exceedsBudget={exceedsCalorieBudget(
                    recipe.calories_per_portion,
                    calorieGoal,
                    calorieRemaining,
                )}
            />
        ))}
    </div>
);
