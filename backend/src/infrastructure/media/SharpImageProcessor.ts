import sharp from "sharp";

import { logger } from "config/logger";

import type {
    ImageProcessor,
    ImageVariant,
} from "application/ports/ImageProcessor";

// a decompression bomb is refused before it is decoded; 40 MP covers any phone's normal photo
const MAX_INPUT_PIXELS = 40_000_000;
const WEBP_QUALITY = 80;

// the backend runs in a 640 MB container: no decoded-image cache, and one libvips thread
sharp.cache(false);
sharp.concurrency(1);

// every upload is re-encoded from scratch, which is what actually disarms one: a polyglot file,
// an embedded payload and EXIF/GPS data are all left behind with the original bytes
export default class SharpImageProcessor implements ImageProcessor {
    // uploads are decoded one at a time, so several at once cannot exhaust the container's memory
    private queue: Promise<unknown> = Promise.resolve();

    toVariants(
        input: Buffer,
        widths: readonly number[],
    ): Promise<ImageVariant[] | null> {
        const run = this.queue.then(() => this.encode(input, widths));

        this.queue = run;

        return run;
    }

    private async encode(
        input: Buffer,
        widths: readonly number[],
    ): Promise<ImageVariant[] | null> {
        try {
            // rotate() applies the EXIF orientation before the metadata is dropped
            const image = sharp(input, {
                limitInputPixels: MAX_INPUT_PIXELS,
                failOn: "truncated",
            }).rotate();

            return await Promise.all(
                widths.map(async (width) => ({
                    width,
                    data: await image
                        .clone()
                        .resize({
                            width,
                            height: width,
                            fit: "inside",
                            withoutEnlargement: true,
                        })
                        .webp({ quality: WEBP_QUALITY })
                        .toBuffer(),
                })),
            );
        } catch (error) {
            logger.warn({ err: error }, "upload rejected by the image decoder");

            return null;
        }
    }
}
