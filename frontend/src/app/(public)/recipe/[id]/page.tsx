import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { recipeDetailsPath } from "constants/routes";
import type { RecipeDetails } from "types/recipe";

import { JsonLd } from "components/seo/JsonLd";
import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { toMetaDescription } from "utils/metaDescription";
import { photoSocialImage, socialMetadata } from "utils/socialMetadata";

import { loadRecipe } from "./loadRecipe";
import { RecipeDetailsView } from "./RecipeDetailsView";
import { recipeJsonLd } from "./recipeJsonLd";

const NAMESPACE = "recipes";

interface RecipePageProps {
    params: Promise<{ id: string }>;
}

const describeRecipe = async (recipe: RecipeDetails): Promise<string> => {
    const t = await getServerTranslation(DEFAULT_LANGUAGE, NAMESPACE);
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
    const { id } = await params;
    const recipe = await loadRecipe(id);

    if (!recipe) {
        return {};
    }

    const description = await describeRecipe(recipe);
    const url = recipeDetailsPath(recipe.id);

    return {
        title: recipe.title,
        description,
        alternates: { canonical: url },
        ...socialMetadata({
            type: "article",
            url,
            title: recipe.title,
            description,
            image: photoSocialImage(recipe.photo_key, recipe.title),
        }),
    };
};

const RecipeDetailsPage = async ({ params }: RecipePageProps) => {
    const { id } = await params;
    const recipe = await loadRecipe(id);

    if (!recipe) {
        notFound();
    }

    return (
        <>
            <JsonLd data={recipeJsonLd(recipe, await describeRecipe(recipe))} />
            <RecipeDetailsView recipe={recipe} />
        </>
    );
};

export default RecipeDetailsPage;
