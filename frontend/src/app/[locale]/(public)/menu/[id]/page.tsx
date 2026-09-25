import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";
import { menuDetailsPath } from "constants/routes";
import type { MenuDetails } from "types/menu";

import { JsonLd } from "components/seo/JsonLd";
import { getServerTranslation } from "i18n/server";

import { toMetaDescription } from "utils/metaDescription";
import { pageAlternates } from "utils/pageAlternates";
import { menuCategoryName } from "utils/referenceLabels";
import { photoSocialImage, socialMetadata } from "utils/socialMetadata";

import { loadMenu } from "./loadMenu";
import { MenuDetailsView } from "./MenuDetailsView";
import { menuJsonLd } from "./menuJsonLd";

const NAMESPACE = "menu";

interface MenuPageProps {
    params: Promise<{ locale: string; id: string }>;
}

const describeMenu = async (
    menu: MenuDetails,
    locale: Locale,
): Promise<string> => {
    const t = await getServerTranslation(locale, NAMESPACE);
    // the category column is nullable, so a menu can have none to name
    const fallbackKey =
        menu.menu.categoryname === null
            ? "menuDetailsPage.metaFallbackDescriptionUncategorised"
            : "menuDetailsPage.metaFallbackDescription";

    return toMetaDescription(
        menu.menu.menucontent,
        t(fallbackKey, {
            category:
                menu.menu.categoryname === null
                    ? undefined
                    : menuCategoryName(
                          t,
                          menu.menu.categoryname,
                      ).toLocaleLowerCase(locale),
            count: menu.recipes.length,
        }),
    );
};

export const generateMetadata = async ({
    params,
}: MenuPageProps): Promise<Metadata> => {
    const { id, locale: param } = await params;
    const locale = toLocale(param);
    const menu = await loadMenu(id, locale);

    if (!menu) {
        return {};
    }

    const description = await describeMenu(menu, locale);
    const path = menuDetailsPath(menu.menu.id);

    return {
        title: menu.menu.title,
        description,
        alternates: pageAlternates(path, locale),
        ...socialMetadata({
            type: "article",
            path,
            locale,
            title: menu.menu.title,
            description,
            image: photoSocialImage(menu.menu.photo_key, menu.menu.title),
        }),
    };
};

const MenuDetailsPage = async ({ params }: MenuPageProps) => {
    const { id, locale: param } = await params;
    const locale = toLocale(param);
    const menu = await loadMenu(id, locale);

    if (!menu) {
        notFound();
    }

    return (
        <>
            <JsonLd
                data={menuJsonLd(
                    menu,
                    await describeMenu(menu, locale),
                    locale,
                )}
            />
            <MenuDetailsView menu={menu} />
        </>
    );
};

export default MenuDetailsPage;
