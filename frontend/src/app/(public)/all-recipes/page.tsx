import type { Metadata } from "next";

import { ROUTES } from "constants/routes";

import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { socialMetadata } from "utils/socialMetadata";

import { AllRecipesView } from "./AllRecipesView";

const NAMESPACE = "recipes";

// filters live in the query string, and every combination of them is the same list of recipes:
// the canonical URL is the unfiltered one, so search engines index it once
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getServerTranslation(DEFAULT_LANGUAGE, NAMESPACE);
    const title = t("mainPage.allRecipes");
    const description = t("mainPage.metaDescription");

    return {
        title,
        description,
        alternates: { canonical: ROUTES.allRecipes },
        ...socialMetadata({
            type: "website",
            url: ROUTES.allRecipes,
            title,
            description,
            image: null,
        }),
    };
};

const AllRecipesPage = () => <AllRecipesView />;

export default AllRecipesPage;
