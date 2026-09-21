export interface ImageVariant {
    width: number;
    data: Buffer;
}

export interface ImageProcessor {
    // null when the bytes do not decode as an image within the size limits
    toVariants(
        input: Buffer,
        widths: readonly number[],
    ): Promise<ImageVariant[] | null>;
}
