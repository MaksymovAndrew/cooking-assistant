import React from "react";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { CalorieDisclaimer } from "components/recipes/CalorieDisclaimer";
import { RecipeDescriptionPanel } from "components/recipes/RecipeDescriptionPanel";
import { RecipeIngredientsPanel } from "components/recipes/RecipeIngredientsPanel";

interface RecipeDetailsSecondaryProps {
    ingredientsAreaClassName: string;
    descriptionAreaClassName: string;
    availability: IngredientAvailability[];
    haveCount: number;
    missingCount: number;
    isOwner: boolean;
    portionCount: number;
    onIncrement: () => void;
    onDecrement: () => void;
    hasCustomCalories: boolean;
    content: string;
    allergens: string[];
}

// the ingredients + description panels, split out of RecipeDetailsPage to keep the page under the pages/ max-lines cap
export const RecipeDetailsSecondary: React.FC<RecipeDetailsSecondaryProps> = ({
    ingredientsAreaClassName,
    descriptionAreaClassName,
    availability,
    haveCount,
    missingCount,
    isOwner,
    portionCount,
    onIncrement,
    onDecrement,
    hasCustomCalories,
    content,
    allergens,
}) => (
    <>
        <div className={ingredientsAreaClassName}>
            <RecipeIngredientsPanel
                availability={availability}
                haveCount={haveCount}
                missingCount={missingCount}
                isOwner={isOwner}
                portionCount={portionCount}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                hasCustomCalories={hasCustomCalories}
            />
            <CalorieDisclaimer />
        </div>
        <div className={descriptionAreaClassName}>
            <RecipeDescriptionPanel content={content} allergens={allergens} />
        </div>
    </>
);
