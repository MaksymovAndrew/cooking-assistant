import { detectImageFormat } from "application/media/detectImageFormat";

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const WEBP = Buffer.concat([
    Buffer.from("RIFF", "latin1"),
    Buffer.from([0x24, 0x00, 0x00, 0x00]),
    Buffer.from("WEBPVP8 ", "latin1"),
]);
const AVIF = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x1c]),
    Buffer.from("ftypavif", "latin1"),
]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>', "utf8");

describe("detectImageFormat", () => {
    it("should recognise a JPEG by its leading bytes", () => {
        expect(detectImageFormat(JPEG)).toBe("jpeg");
    });

    it("should recognise a PNG by its leading bytes", () => {
        expect(detectImageFormat(PNG)).toBe("png");
    });

    it("should recognise a WebP by its RIFF container", () => {
        expect(detectImageFormat(WEBP)).toBe("webp");
    });

    it("should recognise an AVIF by its ftyp brand", () => {
        expect(detectImageFormat(AVIF)).toBe("avif");
    });

    it("should refuse an SVG even though it is an image", () => {
        expect(detectImageFormat(SVG)).toBeNull();
    });

    it("should refuse a text file whatever it is named", () => {
        expect(detectImageFormat(Buffer.from("just text", "utf8"))).toBeNull();
    });

    it("should refuse an empty body", () => {
        expect(detectImageFormat(Buffer.alloc(0))).toBeNull();
    });

    it("should refuse an ftyp box that is not an AVIF", () => {
        const mp4 = Buffer.concat([
            Buffer.from([0x00, 0x00, 0x00, 0x1c]),
            Buffer.from("ftypisom", "latin1"),
        ]);

        expect(detectImageFormat(mp4)).toBeNull();
    });
});
