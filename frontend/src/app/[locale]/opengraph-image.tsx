import { toLocale } from "constants/locales";

import { SocialCard } from "components/social/SocialCard";
import { getServerTranslation } from "i18n/server";

import { renderSocialImage, socialImageEntry } from "app/socialImage";

interface SiteImageProps {
    params: Promise<{ locale: string }>;
}

// the site-wide preview: every route that has no record of its own to show inherits it
export const generateImageMetadata = async ({
    params,
}: {
    params: { locale: string };
}) => {
    const t = await getServerTranslation(toLocale(params.locale));

    return [socialImageEntry(t("appName"))];
};

const SiteSocialImage = async ({ params }: SiteImageProps) => {
    const t = await getServerTranslation(toLocale((await params).locale));

    return renderSocialImage(
        <SocialCard
            appName={t("appName")}
            eyebrow={null}
            title={t("social.tagline")}
            subtitle={null}
            facts={[
                t("nav.recipes"),
                t("nav.menus"),
                t("nav.ingredients"),
                t("nav.shoppingList"),
            ]}
        />,
    );
};

export default SiteSocialImage;
