import type { ImageVariantSpec } from "application/media/mediaFiles";

export interface ImageVariant {
    spec: ImageVariantSpec;
    data: Buffer;
}

export interface ImageProcessor {
    // null when the bytes do not decode as an image within the size limits
    toVariants(
        input: Buffer,
        specs: readonly ImageVariantSpec[],
    ): Promise<ImageVariant[] | null>;
}
