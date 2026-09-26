import React from "react";

import type { Locale } from "constants/locales";
import type { Tag } from "types/tag";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { CalorieDisclaimer } from "components/recipes/CalorieDisclaimer";
import { RecipeDescriptionPanel } from "components/recipes/RecipeDescriptionPanel";
import { RecipeIngredientsPanel } from "components/recipes/RecipeIngredientsPanel";
import { RecipeTagsPanel } from "components/recipes/RecipeTagsPanel";

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
    language: Locale;
    allergens: string[];
    recipeId: number;
    // null for a guest - the tag panel is the viewer's own, so it stays off the page for them
    tags: Tag[] | null;
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
    language,
    allergens,
    recipeId,
    tags,
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
            <RecipeDescriptionPanel
                content={content}
                language={language}
                allergens={allergens}
            />
            {tags !== null && (
                <RecipeTagsPanel recipeId={recipeId} tags={tags} />
            )}
        </div>
    </>
);
