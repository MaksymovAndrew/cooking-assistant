import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";
import { recipeDetailsPath } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { JsonLd } from "components/seo/JsonLd";
import { getServerTranslation } from "i18n/server";

import { toMetaDescription } from "utils/metaDescription";
import { pageAlternates } from "utils/pageAlternates";
import { photoSocialImage, socialMetadata } from "utils/socialMetadata";

import { loadRecipe } from "./loadRecipe";
import { RecipeDetailsView } from "./RecipeDetailsView";
import { recipeJsonLd } from "./recipeJsonLd";

const NAMESPACE = "recipes";

interface RecipePageProps {
    params: Promise<{ locale: string; id: string }>;
}

const describeRecipe = async (
    recipe: RecipeDetails,
    locale: Locale,
): Promise<string> => {
    const t = await getServerTranslation(locale, NAMESPACE);
    // a recipe whose type was deleted has none: the FK is ON DELETE SET NULL
    const fallbackKey =
        recipe.type_name === null
            ? "recipeDetailsPage.metaFallbackDescriptionUntyped"
            : "recipeDetailsPage.metaFallbackDescription";

    return toMetaDescription(
        recipe.content,
        t(fallbackKey, {
            type: recipe.type_name?.toLowerCase(),
            count: recipe.ingredients.length,
        }),
    );
};

export const generateMetadata = async ({
    params,
}: RecipePageProps): Promise<Metadata> => {
    const { id, locale: param } = await params;
    const locale = toLocale(param);
    const recipe = await loadRecipe(id, locale);

    if (!recipe) {
        return {};
    }

    const description = await describeRecipe(recipe, locale);
    const path = recipeDetailsPath(recipe.id);

    return {
        title: recipe.title,
        description,
        alternates: pageAlternates(path, locale),
        ...socialMetadata({
            type: "article",
            path,
            locale,
            title: recipe.title,
            description,
            image: photoSocialImage(recipe.photo_key, recipe.title),
        }),
    };
};

const RecipeDetailsPage = async ({ params }: RecipePageProps) => {
    const { id, locale: param } = await params;
    const locale = toLocale(param);
    const recipe = await loadRecipe(id, locale);

    if (!recipe) {
        notFound();
    }

    return (
        <>
            <JsonLd
                data={recipeJsonLd(
                    recipe,
                    await describeRecipe(recipe, locale),
                )}
            />
            <RecipeDetailsView recipe={recipe} />
        </>
    );
};

export default RecipeDetailsPage;
