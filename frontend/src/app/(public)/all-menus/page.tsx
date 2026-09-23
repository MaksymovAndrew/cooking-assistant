import type { Metadata } from "next";

import { ROUTES } from "constants/routes";

import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { socialMetadata } from "utils/socialMetadata";

import { AllMenusView } from "./AllMenusView";

const NAMESPACE = "menu";

// filters live in the query string, and every combination of them is the same list of menus:
// the canonical URL is the unfiltered one, so search engines index it once
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getServerTranslation(DEFAULT_LANGUAGE, NAMESPACE);
    const title = t("menuPage.allMenus");
    const description = t("menuPage.metaDescription");

    return {
        title,
        description,
        alternates: { canonical: ROUTES.allMenus },
        ...socialMetadata({
            type: "website",
            url: ROUTES.allMenus,
            title,
            description,
            image: null,
        }),
    };
};

const AllMenusPage = () => <AllMenusView />;

export default AllMenusPage;
