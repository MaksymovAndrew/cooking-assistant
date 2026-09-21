import { API_BASE_URL } from "config/env";

import { API_ROUTES } from "api/endpoints";

// the server stores every image at exactly these widths
const WIDTH_BY_SIZE = {
    card: 400,
    hero: 1200,
} as const;

export type MediaSize = keyof typeof WIDTH_BY_SIZE;

// null for a record without a photo, so a caller can hand the result straight to an image slot
export const mediaUrl = (
    key: string | null | undefined,
    size: MediaSize,
): string | null =>
    key
        ? `${API_BASE_URL}${API_ROUTES.media.file(key, WIDTH_BY_SIZE[size])}`
        : null;
