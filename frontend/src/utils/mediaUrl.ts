import { API_BASE_URL } from "config/env";

import { API_ROUTES } from "api/endpoints";

const CARD_WIDTH = 400;
const HERO_WIDTH = 1200;

// the server stores every image in exactly these renditions
const PATH_BY_SIZE = {
    card: (key: string) => API_ROUTES.media.file(key, CARD_WIDTH),
    hero: (key: string) => API_ROUTES.media.file(key, HERO_WIDTH),
    // a fixed 1200x630 JPEG: the one frame and format every link preview renders
    social: API_ROUTES.media.social,
};

export type MediaSize = keyof typeof PATH_BY_SIZE;

export const mediaUrl = (
    key: string | null | undefined,
    size: MediaSize,
): string | null => (key ? `${API_BASE_URL}${PATH_BY_SIZE[size](key)}` : null);

export const mediaSrcSet = (key: string | null | undefined): string | null =>
    key
        ? [CARD_WIDTH, HERO_WIDTH]
              .map(
                  (width) =>
                      `${API_BASE_URL}${API_ROUTES.media.file(key, width)} ${String(width)}w`,
              )
              .join(", ")
        : null;
