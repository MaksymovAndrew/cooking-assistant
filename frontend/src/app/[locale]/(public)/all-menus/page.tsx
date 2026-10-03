import type { Metadata } from "next";

import { toLocale } from "constants/locales";
import { ROUTES } from "constants/routes";

import { getServerTranslation } from "i18n/server";

import { pageAlternates } from "utils/pageAlternates";
import { socialMetadata } from "utils/socialMetadata";

import { AllMenusView } from "./AllMenusView";

const NAMESPACE = "menu";

// every filter combination is the same list, so the canonical URL is the unfiltered one
export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
    const locale = toLocale((await params).locale);
    const t = await getServerTranslation(locale, NAMESPACE);
    const title = t("menuPage.allMenus");
    const description = t("menuPage.metaDescription");

    return {
        title,
        description,
        alternates: pageAlternates(ROUTES.allMenus, locale),
        ...socialMetadata({
            type: "website",
            path: ROUTES.allMenus,
            locale,
            title,
            description,
            image: null,
        }),
    };
};

const AllMenusPage = () => <AllMenusView />;

export default AllMenusPage;
