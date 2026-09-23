import type { TFunction } from "i18next";

import type { RecipeDetails } from "types/recipe";

import { SocialCard } from "components/social/SocialCard";
import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { formatKcal, roundCalories } from "utils/calories";
import { formatRecipeDuration } from "utils/cookingTimeUtils";
import { socialRatingFact } from "utils/socialRatingFact";

import { renderSocialImage, socialImageEntry } from "app/socialImage";

import { loadPublicRecipe } from "./loadRecipe";

interface RecipeImageProps {
    params: Promise<{ id: string }>;
}

// declared for every recipe: it runs without a request (as static params), so it cannot load
// one. A recipe with a photo still previews as that photo - the page's own images take precedence
export const generateImageMetadata = async () => {
    const t = await getServerTranslation();

    return [socialImageEntry(t("social.recipeCardAlt"))];
};

const recipeFacts = (
    recipe: RecipeDetails,
    t: TFunction,
    tCommon: TFunction,
): string[] =>
    [
        recipe.cooking_time === null
            ? null
            : formatRecipeDuration(t, recipe.cooking_time),
        recipe.calories_per_portion === null
            ? null
            : t("recipeDetailsPage.caloriesPerPortion", {
                  count: formatKcal(roundCalories(recipe.calories_per_portion)),
              }),
        socialRatingFact(recipe, tCommon),
    ].filter((fact) => fact !== null);

const RecipeSocialImage = async ({ params }: RecipeImageProps) => {
    const { id } = await params;
    const recipe = await loadPublicRecipe(id);

    if (!recipe) {
        return new Response(null, { status: 404 });
    }

    const [t, tCommon] = await Promise.all([
        getServerTranslation(DEFAULT_LANGUAGE, "recipes"),
        getServerTranslation(),
    ]);

    return renderSocialImage(
        <SocialCard
            appName={tCommon("appName")}
            eyebrow={recipe.type_name}
            title={recipe.title}
            subtitle={tCommon("author.byline", {
                name: recipe.author.name,
                initial: recipe.author.surname_initial,
            })}
            facts={recipeFacts(recipe, t, tCommon)}
        />,
    );
};

export default RecipeSocialImage;
