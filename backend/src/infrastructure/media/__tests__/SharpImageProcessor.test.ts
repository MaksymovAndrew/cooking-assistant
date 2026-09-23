import { crc32, deflateSync } from "node:zlib";
import sharp from "sharp";

import { logger } from "config/logger";

import { IMAGE_VARIANTS } from "application/media/mediaFiles";

import SharpImageProcessor from "infrastructure/media/SharpImageProcessor";

const [CARD, HERO, SOCIAL] = IMAGE_VARIANTS;
const PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function uint32(value: number): Buffer {
    const bytes = Buffer.alloc(4);

    bytes.writeUInt32BE(value);

    return bytes;
}

function pngChunk(type: string, data: Buffer): Buffer {
    const body = Buffer.concat([Buffer.from(type, "latin1"), data]);

    return Buffer.concat([uint32(data.length), body, uint32(crc32(body))]);
}

// a genuine, valid PNG of 7000x7000 one-bit pixels: a few kilobytes on the wire, 49 megapixels
// once decoded - the shape of a decompression bomb
function decompressionBomb(): Buffer {
    const side = 7000;
    const rowBytes = Math.ceil(side / 8) + 1;
    const header = Buffer.concat([
        uint32(side),
        uint32(side),
        Buffer.from([1, 0, 0, 0, 0]),
    ]);

    return Buffer.concat([
        PNG_SIGNATURE,
        pngChunk("IHDR", header),
        pngChunk("IDAT", deflateSync(Buffer.alloc(rowBytes * side))),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);
}

function solidImage(width: number, height: number) {
    return sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 200, g: 120, b: 40 },
        },
    });
}

describe("SharpImageProcessor", () => {
    it("should produce every variant in its own format and frame", async () => {
        const input = await solidImage(1600, 900).png().toBuffer();

        const variants = await new SharpImageProcessor().toVariants(
            input,
            IMAGE_VARIANTS,
        );

        const sizes = await Promise.all(
            (variants ?? []).map(async ({ spec, data }) => {
                const metadata = await sharp(data).metadata();

                return [
                    spec.name,
                    metadata.format,
                    metadata.width,
                    metadata.height,
                ];
            }),
        );

        expect(sizes).toEqual([
            ["400", "webp", 400, 225],
            ["1200", "webp", 1200, 675],
            ["og", "jpeg", 1200, 630],
        ]);
    });

    it("should never enlarge an image smaller than the target width", async () => {
        const input = await solidImage(300, 200).jpeg().toBuffer();

        const variants = await new SharpImageProcessor().toVariants(input, [
            HERO,
        ]);
        const metadata = await sharp(variants?.[0].data).metadata();

        expect(metadata.width).toBe(300);
    });

    it("should fill the link preview frame exactly, even from a small photo", async () => {
        const input = await solidImage(300, 400).jpeg().toBuffer();

        const variants = await new SharpImageProcessor().toVariants(input, [
            SOCIAL,
        ]);
        const metadata = await sharp(variants?.[0].data).metadata();

        expect([metadata.width, metadata.height]).toEqual([1200, 630]);
    });

    it("should drop the EXIF data of the original, location included", async () => {
        const input = await solidImage(800, 600)
            .jpeg()
            .withExif({
                IFD0: { Copyright: "someone" },
                IFD3: { GPSLatitudeRef: "N", GPSLatitude: "50/1 27/1 0/1" },
            })
            .toBuffer();

        expect((await sharp(input).metadata()).exif).toBeDefined();

        const variants = await new SharpImageProcessor().toVariants(input, [
            CARD,
        ]);

        expect(
            (await sharp(variants?.[0].data).metadata()).exif,
        ).toBeUndefined();
    });

    it("should stand a photo upright according to its EXIF orientation", async () => {
        const input = await solidImage(400, 200)
            .jpeg()
            .withMetadata({ orientation: 6 })
            .toBuffer();

        const variants = await new SharpImageProcessor().toVariants(input, [
            CARD,
        ]);
        const metadata = await sharp(variants?.[0].data).metadata();

        expect(metadata.height).toBeGreaterThan(metadata.width);
    });

    it("should refuse a decompression bomb without decoding it", async () => {
        const warnSpy = jest.spyOn(logger, "warn").mockImplementation();

        const variants = await new SharpImageProcessor().toVariants(
            decompressionBomb(),
            IMAGE_VARIANTS,
        );

        expect(variants).toBeNull();

        const [[logged]] = warnSpy.mock.calls as [[{ err: Error }]];

        expect(logged.err.message).toContain("pixel limit");
    });

    it("should refuse a truncated image", async () => {
        jest.spyOn(logger, "warn").mockImplementation();
        const input = await solidImage(800, 600).jpeg().toBuffer();

        const variants = await new SharpImageProcessor().toVariants(
            input.subarray(0, input.length / 2),
            IMAGE_VARIANTS,
        );

        expect(variants).toBeNull();
    });

    it("should keep working after an upload it refused", async () => {
        jest.spyOn(logger, "warn").mockImplementation();
        const processor = new SharpImageProcessor();
        const input = await solidImage(500, 500).png().toBuffer();

        const [refused, accepted] = await Promise.all([
            processor.toVariants(Buffer.from("not an image"), IMAGE_VARIANTS),
            processor.toVariants(input, [CARD]),
        ]);

        expect(refused).toBeNull();
        expect(accepted).toHaveLength(1);
    });
});
