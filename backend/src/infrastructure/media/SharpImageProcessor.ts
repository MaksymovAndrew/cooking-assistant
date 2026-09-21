import sharp from "sharp";

import { logger } from "config/logger";

import type { ImageVariantSpec } from "application/media/mediaFiles";
import type {
    ImageProcessor,
    ImageVariant,
} from "application/ports/ImageProcessor";

// a decompression bomb is refused before it is decoded; 40 MP covers any phone's normal photo
const MAX_INPUT_PIXELS = 40_000_000;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 82;

// the backend runs in a 640 MB container: no decoded-image cache, and one libvips thread
sharp.cache(false);
sharp.concurrency(1);

// a fixed frame crops around the most eye-catching region rather than the plain centre, and
// may enlarge a small photo: a link preview needs exactly its size
function encodeVariant(image: sharp.Sharp, spec: ImageVariantSpec) {
    const resized = image.resize({
        width: spec.width,
        height: spec.height,
        fit: spec.fit,
        position: sharp.strategy.attention,
        withoutEnlargement: spec.fit === "inside",
    });

    return spec.format === "jpeg"
        ? resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
        : resized.webp({ quality: WEBP_QUALITY }).toBuffer();
}

// every upload is re-encoded from scratch, which is what actually disarms one: a polyglot file,
// an embedded payload and EXIF/GPS data are all left behind with the original bytes
export default class SharpImageProcessor implements ImageProcessor {
    // uploads are decoded one at a time, so several at once cannot exhaust the container's memory
    private queue: Promise<unknown> = Promise.resolve();

    toVariants(
        input: Buffer,
        specs: readonly ImageVariantSpec[],
    ): Promise<ImageVariant[] | null> {
        const run = this.queue.then(() => this.encode(input, specs));

        this.queue = run;

        return run;
    }

    private async encode(
        input: Buffer,
        specs: readonly ImageVariantSpec[],
    ): Promise<ImageVariant[] | null> {
        try {
            // rotate() applies the EXIF orientation before the metadata is dropped
            const image = sharp(input, {
                limitInputPixels: MAX_INPUT_PIXELS,
                failOn: "truncated",
            }).rotate();

            return await Promise.all(
                specs.map(async (spec) => ({
                    spec,
                    data: await encodeVariant(image.clone(), spec),
                })),
            );
        } catch (error) {
            logger.warn({ err: error }, "upload rejected by the image decoder");

            return null;
        }
    }
}
