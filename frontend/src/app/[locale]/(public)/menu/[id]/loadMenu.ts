import { cache } from "react";

import type { Locale } from "constants/locales";
import { SOCIAL_IMAGE_REVALIDATE_SECONDS } from "constants/social";
import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor, fetchPublic } from "api/server";

import { getServerTranslation } from "i18n/server";

import { localizeMenuIngredients } from "utils/localizeIngredientNames";
import { isRecordId } from "utils/recordIdParam";

// the metadata and the page both need the menu; cache() makes that one request, in the page's language
export const loadMenu = cache(
    async (id: string, locale: Locale): Promise<MenuDetails | null> => {
        if (!isRecordId(id)) {
            return null;
        }

        const menu = await fetchAsVisitor<MenuDetails>(
            API_ROUTES.menu.byId(id),
            locale,
        );

        return (
            menu &&
            localizeMenuIngredients(await getServerTranslation(locale), menu)
        );
    },
);

// the preview image carries nothing per viewer: no session, so it can be built once and cached
export const loadPublicMenu = async (
    id: string,
): Promise<MenuDetails | null> =>
    isRecordId(id)
        ? fetchPublic<MenuDetails>(
              API_ROUTES.menu.byId(id),
              SOCIAL_IMAGE_REVALIDATE_SECONDS,
          )
        : null;
