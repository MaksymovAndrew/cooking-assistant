import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { logger } from "config/logger";

import { IMAGE_VARIANTS, mediaFileName } from "application/media/mediaFiles";
import type { ImageVariant } from "application/ports/ImageProcessor";
import type { MediaStorage } from "application/ports/MediaStorage";

// checked by shape, not instanceof: a filesystem error need not come from this realm's Error
function isMissingFile(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
    );
}

export default class LocalDiskMediaStorage implements MediaStorage {
    constructor(private directory: string) {}

    async save(key: string, variants: ImageVariant[]): Promise<void> {
        await mkdir(this.directory, { recursive: true });

        // "wx": a generated key never collides, so an existing file means something is wrong
        await Promise.all(
            variants.map((variant) =>
                writeFile(
                    this.pathFor(mediaFileName(key, variant.spec)),
                    variant.data,
                    { flag: "wx" },
                ),
            ),
        );
    }

    async remove(key: string): Promise<void> {
        await Promise.all(
            IMAGE_VARIANTS.map(async (spec) => {
                const file = this.pathFor(mediaFileName(key, spec));

                try {
                    await rm(file, { force: true });
                } catch (error) {
                    logger.warn({ err: error, file }, "could not remove image");
                }
            }),
        );
    }

    async locate(fileName: string): Promise<string | null> {
        const file = this.pathFor(fileName);

        try {
            const stats = await stat(file);

            return stats.isFile() ? file : null;
        } catch (error) {
            // only a missing file is a 404; a permissions fault is an incident and must surface
            if (isMissingFile(error)) {
                return null;
            }

            throw error;
        }
    }

    // basename is a second guard behind the use case's name pattern: no separator ever survives
    private pathFor(fileName: string): string {
        return path.join(this.directory, path.basename(fileName));
    }
}
