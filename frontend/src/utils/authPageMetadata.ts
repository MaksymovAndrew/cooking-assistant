import type { Metadata } from "next";

import { toLocale } from "constants/locales";
import { UNINDEXED_AUTH_PATHS } from "constants/routes";

import { getServerTranslation } from "i18n/server";

import { pageAlternates } from "utils/pageAlternates";
import { socialMetadata } from "utils/socialMetadata";

const NAMESPACE = "auth";

const NOT_INDEXED: Pick<Metadata, "robots"> = {
    robots: { index: false, follow: false },
};

interface AuthPage {
    path: string;
    titleKey: string;
    descriptionKey: string;
}

interface LocaleParams {
    params: Promise<{ locale: string }>;
}

// the sign-in pages are client components, so their route layout exports this in their place
export const authPageMetadata =
    ({ path, titleKey, descriptionKey }: AuthPage) =>
    async ({ params }: LocaleParams): Promise<Metadata> => {
        const locale = toLocale((await params).locale);
        const t = await getServerTranslation(locale, NAMESPACE);
        const title = t(titleKey);
        const description = t(descriptionKey);

        return {
            title,
            description,
            alternates: pageAlternates(path, locale),
            ...socialMetadata({
                type: "website",
                path,
                locale,
                title,
                description,
                image: null,
            }),
            ...(UNINDEXED_AUTH_PATHS.includes(path) ? NOT_INDEXED : {}),
        };
    };
