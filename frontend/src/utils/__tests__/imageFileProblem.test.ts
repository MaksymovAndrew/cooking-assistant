import { ERROR_CODES } from "constants/errorCodes";
import { MAX_IMAGE_BYTES } from "constants/media";

import { imageFileProblem } from "utils/imageFileProblem";

const fileOf = (type: string, size = 1) =>
    new File([new Uint8Array(size)], "photo", { type });

describe("imageFileProblem", () => {
    it("should accept a supported image within the size limit", () => {
        expect(imageFileProblem(fileOf("image/webp"))).toBeNull();
    });

    it("should reject a type the server does not accept", () => {
        expect(imageFileProblem(fileOf("image/svg+xml"))).toBe(
            ERROR_CODES.MEDIA_UNSUPPORTED_TYPE,
        );
    });

    it("should reject a file larger than the upload limit", () => {
        expect(imageFileProblem(fileOf("image/png", MAX_IMAGE_BYTES + 1))).toBe(
            ERROR_CODES.MEDIA_TOO_LARGE,
        );
    });
});
