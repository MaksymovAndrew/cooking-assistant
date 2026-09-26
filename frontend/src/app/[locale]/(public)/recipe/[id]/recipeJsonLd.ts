import type { TFunction } from "i18next";

import { absoluteSiteUrl } from "config/site";
import { DEFAULT_LOCALE, type Locale } from "constants/locales";
import { MAX_RATING, MIN_RATING } from "constants/ratings";
import { recipeDetailsPath } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { isoDuration } from "utils/cookingTimeUtils";
import { formatRatingAverage } from "utils/formatRating";
import { localizePath } from "utils/localePath";
import { mediaUrl } from "utils/mediaUrl";
import { quantityWithUnit, recipeTypeName } from "utils/referenceLabels";

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
// the recipe arrives with its ingredient names already in the page language (loadRecipe)
export const recipeJsonLd = (
    recipe: RecipeDetails,
    description: string,
    t: TFunction,
    locale: Locale,
) => ({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    // the language the recipe is written in, which may differ from the page around it
    inLanguage: recipe.language,
    description,
    url: absoluteSiteUrl(localizePath(recipeDetailsPath(recipe.id), locale)),
    image: recipeImages(recipe.photo_key),
    datePublished: recipe.creation_date,
    author: {
        "@type": "Person",
        name: `${recipe.author.name} ${recipe.author.surname_initial}.`,
    },
    recipeCategory:
        recipe.type_name === null
            ? undefined
            : recipeTypeName(t, recipe.type_name),
    totalTime:
        recipe.cooking_time === null
            ? undefined
            : isoDuration(recipe.cooking_time),
    recipeIngredient: recipe.ingredients.map(
        (ingredient) =>
            `${quantityWithUnit(t, locale, ingredient.quantity_recipe_ingredients, ingredient.unit_name)} ${ingredient.name}`,
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
                  // structured data is read by machines, which expect a dot decimal whatever the page's language
                  ratingValue: formatRatingAverage(
                      recipe.ratingAverage,
                      DEFAULT_LOCALE,
                  ),
                  ratingCount: recipe.ratingCount,
                  bestRating: MAX_RATING,
                  worstRating: MIN_RATING,
              },
});
