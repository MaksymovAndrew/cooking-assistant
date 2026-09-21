const CARD_WIDTH = 400;
const HERO_WIDTH = 1200;

// every stored image exists at these widths: cards use the small one, heroes and link previews the large
export const IMAGE_WIDTHS = [CARD_WIDTH, HERO_WIDTH] as const;

export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

export const MEDIA_EXTENSION = "webp";

export const MEDIA_CONTENT_TYPE = "image/webp";

const UUID_PATTERN =
    "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// the only file names the media route will ever resolve - nothing else can reach the disk
export const MEDIA_FILE_NAME_PATTERN = new RegExp(
    `^${UUID_PATTERN}-(${IMAGE_WIDTHS.join("|")})[.]${MEDIA_EXTENSION}$`,
);

export function mediaFileName(key: string, width: number): string {
    return `${key}-${width}.${MEDIA_EXTENSION}`;
}
