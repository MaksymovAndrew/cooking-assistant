import { SocialCard } from "components/social/SocialCard";
import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { socialRatingFact } from "utils/socialRatingFact";

import { renderSocialImage, socialImageEntry } from "app/socialImage";

import { loadPublicMenu } from "./loadMenu";

interface MenuImageProps {
    params: Promise<{ id: string }>;
}

// declared for every menu: it runs without a request (as static params), so it cannot load one.
// A menu with a cover photo still previews as that photo - the page's own images take precedence
export const generateImageMetadata = async () => {
    const t = await getServerTranslation();

    return [socialImageEntry(t("social.menuCardAlt"))];
};

const MenuSocialImage = async ({ params }: MenuImageProps) => {
    const { id } = await params;
    const details = await loadPublicMenu(id);

    if (!details) {
        return new Response(null, { status: 404 });
    }

    const { menu, recipes } = details;
    const [t, tCommon] = await Promise.all([
        getServerTranslation(DEFAULT_LANGUAGE, "menu"),
        getServerTranslation(),
    ]);
    const facts = [
        t("menuDetailsPage.recipesCaption", { count: recipes.length }),
        socialRatingFact(menu, tCommon),
    ].filter((fact) => fact !== null);

    return renderSocialImage(
        <SocialCard
            appName={tCommon("appName")}
            eyebrow={menu.categoryname}
            title={menu.title}
            subtitle={tCommon("author.byline", {
                name: menu.author.name,
                initial: menu.author.surname_initial,
            })}
            facts={facts}
        />,
    );
};

export default MenuSocialImage;
