import type { Metadata } from "next";

import type { Locale } from "constants/locales";
import { LOCALES, OPEN_GRAPH_LOCALES } from "constants/locales";
import { SOCIAL_IMAGE_SIZE } from "constants/social";

import { localizePath } from "utils/localePath";
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
    // the route's path; it is shown in the page's own language
    path: string;
    locale: Locale;
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
    path,
    locale,
    title,
    description,
    image,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> => {
    const images = image ? { images: [image] } : {};

    return {
        openGraph: {
            type,
            url: localizePath(path, locale),
            title,
            description,
            locale: OPEN_GRAPH_LOCALES[locale],
            alternateLocale: LOCALES.filter(
                (language) => language !== locale,
            ).map((language) => OPEN_GRAPH_LOCALES[language]),
            ...images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...images,
        },
    };
};
