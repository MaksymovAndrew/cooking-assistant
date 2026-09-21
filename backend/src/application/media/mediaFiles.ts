const OUTPUT_FORMATS = {
    webp: { extension: "webp", contentType: "image/webp" },
    jpeg: { extension: "jpg", contentType: "image/jpeg" },
} as const;

export type OutputFormat = keyof typeof OUTPUT_FORMATS;

export interface ImageVariantSpec {
    // the file name suffix after the key
    name: string;
    width: number;
    height: number;
    // inside: scaled down to fit the box, never up; cover: filled and cropped to exactly the box
    fit: "inside" | "cover";
    format: OutputFormat;
}

// every stored image exists in each of these: cards use the small one, heroes the large, and link
// previews the fixed 1.91:1 JPEG - the one frame and format every messenger renders
export const IMAGE_VARIANTS: readonly ImageVariantSpec[] = [
    { name: "400", width: 400, height: 400, fit: "inside", format: "webp" },
    { name: "1200", width: 1200, height: 1200, fit: "inside", format: "webp" },
    { name: "og", width: 1200, height: 630, fit: "cover", format: "jpeg" },
];

const UUID_PATTERN =
    "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const variantSuffix = (spec: ImageVariantSpec): string =>
    `${spec.name}.${OUTPUT_FORMATS[spec.format].extension}`;

// the only file names the media route will ever resolve - nothing else can reach the disk
const MEDIA_FILE_NAME_PATTERN = new RegExp(
    `^${UUID_PATTERN}-(${IMAGE_VARIANTS.map(variantSuffix)
        .join("|")
        .replaceAll(".", "[.]")})$`,
);

export function mediaFileName(key: string, spec: ImageVariantSpec): string {
    return `${key}-${variantSuffix(spec)}`;
}

// null for any name we did not generate
export function variantOfFileName(fileName: string): ImageVariantSpec | null {
    if (!MEDIA_FILE_NAME_PATTERN.test(fileName)) {
        return null;
    }

    return (
        IMAGE_VARIANTS.find((spec) =>
            fileName.endsWith(`-${variantSuffix(spec)}`),
        ) ?? null
    );
}

export function contentTypeOf(spec: ImageVariantSpec): string {
    return OUTPUT_FORMATS[spec.format].contentType;
}
