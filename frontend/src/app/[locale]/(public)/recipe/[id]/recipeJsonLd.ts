import { absoluteSiteUrl } from "config/site";
import { MAX_RATING, MIN_RATING } from "constants/ratings";
import { recipeDetailsPath } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { isoDuration } from "utils/cookingTimeUtils";
import { formatRatingAverage } from "utils/formatRating";
import { mediaUrl } from "utils/mediaUrl";
import { roundQuantity } from "utils/roundQuantity";

// the method is free text; each non-empty line reads as one step
const instructionSteps = (content: string) =>
    content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ "@type": "HowToStep", text }));

// both renditions, since search engines pick the aspect ratio that suits their layout
const recipeImages = (photoKey: string | null) => {
    const social = mediaUrl(photoKey, "social");
    const hero = mediaUrl(photoKey, "hero");

    return social && hero
        ? [absoluteSiteUrl(social), absoluteSiteUrl(hero)]
        : undefined;
};

// schema.org/Recipe for search engines; a field the recipe does not have is left out, never faked
export const recipeJsonLd = (recipe: RecipeDetails, description: string) => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description,
    url: absoluteSiteUrl(recipeDetailsPath(recipe.id)),
    image: recipeImages(recipe.photo_key),
    datePublished: recipe.creation_date,
    author: {
        "@type": "Person",
        name: `${recipe.author.name} ${recipe.author.surname_initial}.`,
    },
    recipeCategory: recipe.type_name ?? undefined,
    totalTime:
        recipe.cooking_time === null
            ? undefined
            : isoDuration(recipe.cooking_time),
    recipeIngredient: recipe.ingredients.map(
        (ingredient) =>
            `${roundQuantity(ingredient.quantity_recipe_ingredients)} ${ingredient.unit_name} ${ingredient.name}`,
    ),
    recipeInstructions: instructionSteps(recipe.content),
    nutrition:
        recipe.calories_per_portion === null
            ? undefined
            : {
                  "@type": "NutritionInformation",
                  calories: `${Math.round(recipe.calories_per_portion)} calories`,
              },
    aggregateRating:
        recipe.ratingAverage === null
            ? undefined
            : {
                  "@type": "AggregateRating",
                  ratingValue: formatRatingAverage(recipe.ratingAverage),
                  ratingCount: recipe.ratingCount,
                  bestRating: MAX_RATING,
                  worstRating: MIN_RATING,
              },
});
