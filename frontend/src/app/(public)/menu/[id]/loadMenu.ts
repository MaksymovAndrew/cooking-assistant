import { cache } from "react";

import { SOCIAL_IMAGE_REVALIDATE_SECONDS } from "constants/social";
import type { MenuDetails } from "types/menu";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor, fetchPublic } from "api/server";

import { isRecordId } from "utils/recordIdParam";

// the metadata and the page both need the menu; cache() makes that one request
export const loadMenu = cache(
    async (id: string): Promise<MenuDetails | null> =>
        isRecordId(id)
            ? fetchAsVisitor<MenuDetails>(API_ROUTES.menu.byId(id))
            : null,
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
