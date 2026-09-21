export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

const JPEG_SIGNATURE = Buffer.from("ffd8ff", "hex");
const PNG_SIGNATURE = Buffer.from("89504e470d0a1a0a", "hex");
// WebP is a RIFF container; AVIF an ISO box file whose ftyp box names its brand
const WEBP_FORMAT_OFFSET = 8;
const FTYP_OFFSET = 4;
const BRAND_OFFSET = 8;
const BRAND_LENGTH = 4;
const AVIF_BRANDS = new Set(["avif", "avis"]);

function hasAscii(bytes: Buffer, offset: number, text: string): boolean {
    return bytes.toString("latin1", offset, offset + text.length) === text;
}

function isWebp(bytes: Buffer): boolean {
    return (
        hasAscii(bytes, 0, "RIFF") &&
        hasAscii(bytes, WEBP_FORMAT_OFFSET, "WEBP")
    );
}

function isAvif(bytes: Buffer): boolean {
    const brand = bytes.toString(
        "latin1",
        BRAND_OFFSET,
        BRAND_OFFSET + BRAND_LENGTH,
    );

    return hasAscii(bytes, FTYP_OFFSET, "ftyp") && AVIF_BRANDS.has(brand);
}

// read from the bytes themselves, never the file name or the request's Content-Type; anything
// else - SVG above all, a script container - is refused before a decoder ever parses it
export function detectImageFormat(bytes: Buffer): ImageFormat | null {
    if (bytes.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) {
        return "jpeg";
    }

    if (bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
        return "png";
    }

    if (isWebp(bytes)) {
        return "webp";
    }

    return isAvif(bytes) ? "avif" : null;
}
