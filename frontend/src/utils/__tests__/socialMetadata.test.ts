import { API_BASE_URL } from "config/env";

import { API_ROUTES } from "api/endpoints";

import { photoSocialImage, socialMetadata } from "utils/socialMetadata";

const KEY = "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b";
const PAGE = {
    type: "article" as const,
    url: "/recipe/7",
    title: "Borscht",
    description: "Boil the beetroot.",
};

describe("socialMetadata", () => {
    it("should preview a photo as the fixed-frame JPEG the server keeps", () => {
        expect(photoSocialImage(KEY, "Borscht")).toEqual({
            url: `${API_BASE_URL}${API_ROUTES.media.social(KEY)}`,
            width: 1200,
            height: 630,
            type: "image/jpeg",
            alt: "Borscht",
        });
    });

    it("should have no photo image for a record without a photo", () => {
        expect(photoSocialImage(null, "Borscht")).toBeNull();
    });

    it("should put the photo on both the Open Graph and the X card", () => {
        const image = photoSocialImage(KEY, "Borscht");
        const metadata = socialMetadata({ ...PAGE, image });

        expect(metadata.openGraph?.images).toEqual([image]);
        expect(metadata.twitter?.images).toEqual([image]);
    });

    it("should leave the images out entirely so the generated card stays", () => {
        const metadata = socialMetadata({ ...PAGE, image: null });

        expect(metadata.openGraph).not.toHaveProperty("images");
        expect(metadata.twitter).not.toHaveProperty("images");
    });

    it("should always ask for the large card", () => {
        const metadata = socialMetadata({ ...PAGE, image: null });

        expect(metadata.twitter).toEqual(
            expect.objectContaining({ card: "summary_large_image" }),
        );
    });
});
