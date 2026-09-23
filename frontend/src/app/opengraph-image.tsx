import { SocialCard } from "components/social/SocialCard";
import { getServerTranslation } from "i18n/server";

import { renderSocialImage, socialImageEntry } from "./socialImage";

// the site-wide preview: every route that has no record of its own to show inherits it
export const generateImageMetadata = async () => {
    const t = await getServerTranslation();

    return [socialImageEntry(t("appName"))];
};

const SiteSocialImage = async () => {
    const t = await getServerTranslation();

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
