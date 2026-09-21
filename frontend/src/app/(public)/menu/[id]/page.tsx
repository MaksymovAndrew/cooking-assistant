import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { menuDetailsPath } from "constants/routes";
import type { MenuDetails } from "types/menu";

import { JsonLd } from "components/seo/JsonLd";
import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { toMetaDescription } from "utils/metaDescription";
import { photoSocialImage, socialMetadata } from "utils/socialMetadata";

import { loadMenu } from "./loadMenu";
import { MenuDetailsView } from "./MenuDetailsView";
import { menuJsonLd } from "./menuJsonLd";

const NAMESPACE = "menu";

interface MenuPageProps {
    params: Promise<{ id: string }>;
}

const describeMenu = async (menu: MenuDetails): Promise<string> => {
    const t = await getServerTranslation(DEFAULT_LANGUAGE, NAMESPACE);
    // the category column is nullable, so a menu can have none to name
    const fallbackKey =
        menu.menu.categoryname === null
            ? "menuDetailsPage.metaFallbackDescriptionUncategorised"
            : "menuDetailsPage.metaFallbackDescription";

    return toMetaDescription(
        menu.menu.menucontent,
        t(fallbackKey, {
            category: menu.menu.categoryname?.toLowerCase(),
            count: menu.recipes.length,
        }),
    );
};

export const generateMetadata = async ({
    params,
}: MenuPageProps): Promise<Metadata> => {
    const { id } = await params;
    const menu = await loadMenu(id);

    if (!menu) {
        return {};
    }

    const description = await describeMenu(menu);
    const url = menuDetailsPath(menu.menu.id);

    return {
        title: menu.menu.title,
        description,
        alternates: { canonical: url },
        ...socialMetadata({
            type: "article",
            url,
            title: menu.menu.title,
            description,
            image: photoSocialImage(menu.menu.photo_key, menu.menu.title),
        }),
    };
};

const MenuDetailsPage = async ({ params }: MenuPageProps) => {
    const { id } = await params;
    const menu = await loadMenu(id);

    if (!menu) {
        notFound();
    }

    return (
        <>
            <JsonLd data={menuJsonLd(menu, await describeMenu(menu))} />
            <MenuDetailsView menu={menu} />
        </>
    );
};

export default MenuDetailsPage;
