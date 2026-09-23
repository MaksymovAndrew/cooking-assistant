import type { Metadata } from "next";

import { SOCIAL_IMAGE_SIZE } from "constants/social";

import { mediaUrl } from "utils/mediaUrl";

interface SocialImage {
    url: string;
    width: number;
    height: number;
    type: string;
    alt: string;
}

interface SocialMetadataInput {
    type: "website" | "article";
    url: string;
    title: string;
    description: string;
    // null leaves the route's generated card in place
    image: SocialImage | null;
}

// a record's own photo, in the fixed-frame JPEG the server keeps for exactly this
export const photoSocialImage = (
    photoKey: string | null,
    alt: string,
): SocialImage | null => {
    const url = mediaUrl(photoKey, "social");

    return url ? { url, ...SOCIAL_IMAGE_SIZE, type: "image/jpeg", alt } : null;
};

// a route that sets its own openGraph replaces the parent's wholesale, so every page restates the
// large card type. The images key is left out entirely without a photo: even an undefined one
// overrides the route's generated card with nothing
export const socialMetadata = ({
    type,
    url,
    title,
    description,
    image,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> => {
    const images = image ? { images: [image] } : {};

    return {
        openGraph: { type, url, title, description, ...images },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...images,
        },
    };
};
