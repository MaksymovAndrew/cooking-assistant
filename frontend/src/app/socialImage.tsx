import "server-only";

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import type { ReactElement } from "react";

import { SOCIAL_IMAGE_SIZE } from "constants/social";

const SOCIAL_IMAGE_TYPE = "image/png";

const font = async (
    name: string,
    weight: 400 | 600,
    file: Promise<Buffer>,
) => ({
    name,
    weight,
    style: "normal" as const,
    data: await file,
});

// each path is a literal so the build traces exactly these files - a path held in a variable
// makes it trace the whole project into the server bundle. Inter carries the Cyrillic that
// Fraunces lacks, so a title in any locale still renders
const readFonts = () =>
    Promise.all([
        font(
            "Fraunces",
            600,
            readFile(
                new URL(
                    "../assets/fonts/Fraunces/Fraunces-SemiBold.ttf",
                    import.meta.url,
                ),
            ),
        ),
        font(
            "Inter",
            400,
            readFile(
                new URL(
                    "../assets/fonts/Inter/Inter-Regular.ttf",
                    import.meta.url,
                ),
            ),
        ),
        font(
            "Inter",
            600,
            readFile(
                new URL(
                    "../assets/fonts/Inter/Inter-SemiBold.ttf",
                    import.meta.url,
                ),
            ),
        ),
    ]);

let fontsPromise: ReturnType<typeof readFonts> | null = null;

// read once per process; a failed read is retried on the next image rather than cached
const loadFonts = () => {
    fontsPromise ??= readFonts().catch((error: unknown) => {
        fontsPromise = null;

        throw error;
    });

    return fontsPromise;
};

// what generateImageMetadata returns for one image, so the og:image size and type tags are emitted
export const socialImageEntry = (alt: string) => ({
    id: "card",
    alt,
    size: SOCIAL_IMAGE_SIZE,
    contentType: SOCIAL_IMAGE_TYPE,
});

export const renderSocialImage = async (
    card: ReactElement,
): Promise<ImageResponse> =>
    new ImageResponse(card, {
        ...SOCIAL_IMAGE_SIZE,
        fonts: await loadFonts(),
    });
