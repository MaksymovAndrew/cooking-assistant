import { API_BASE_URL } from "config/env";

import { API_ROUTES } from "api/endpoints";

import { mediaSrcSet, mediaUrl } from "utils/mediaUrl";

const KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";

describe("mediaUrl", () => {
    it("should point a card at the narrow rendition", () => {
        expect(mediaUrl(KEY, "card")).toBe(
            `${API_BASE_URL}${API_ROUTES.media.file(KEY, 400)}`,
        );
    });

    it("should point a hero at the wide rendition", () => {
        expect(mediaUrl(KEY, "hero")).toBe(
            `${API_BASE_URL}${API_ROUTES.media.file(KEY, 1200)}`,
        );
    });

    it("should point a link preview at the fixed-frame JPEG", () => {
        expect(mediaUrl(KEY, "social")).toBe(
            `${API_BASE_URL}${API_ROUTES.media.social(KEY)}`,
        );
    });

    it("should return null for a record without a photo", () => {
        expect(mediaUrl(null, "card")).toBeNull();
    });
});

describe("mediaSrcSet", () => {
    it("should offer the narrow and the wide rendition by their widths", () => {
        expect(mediaSrcSet(KEY)).toBe(
            `${API_BASE_URL}${API_ROUTES.media.file(KEY, 400)} 400w, ${API_BASE_URL}${API_ROUTES.media.file(KEY, 1200)} 1200w`,
        );
    });

    it("should return null for a record without a photo", () => {
        expect(mediaSrcSet(null)).toBeNull();
    });
});
