import type { Metadata } from "next";

import { toLocale } from "constants/locales";
import { ROUTES } from "constants/routes";

import { getServerTranslation } from "i18n/server";

import { pageAlternates } from "utils/pageAlternates";
import { socialMetadata } from "utils/socialMetadata";

import { AllRecipesView } from "./AllRecipesView";

const NAMESPACE = "recipes";

// filters live in the query string, and every combination of them is the same list of recipes:
// the canonical URL is the unfiltered one, so search engines index it once
export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
    const locale = toLocale((await params).locale);
    const t = await getServerTranslation(locale, NAMESPACE);
    const title = t("mainPage.allRecipes");
    const description = t("mainPage.metaDescription");

    return {
        title,
        description,
        alternates: pageAlternates(ROUTES.allRecipes, locale),
        ...socialMetadata({
            type: "website",
            path: ROUTES.allRecipes,
            locale,
            title,
            description,
            image: null,
        }),
    };
};

const AllRecipesPage = () => <AllRecipesView />;

export default AllRecipesPage;
