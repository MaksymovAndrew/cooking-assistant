import type { MediaStorage } from "application/ports/MediaStorage";

// files go only after their record is deleted, so no record ever points at a missing file
export default class PhotoCleanup {
    constructor(private mediaStorage: Pick<MediaStorage, "remove">) {}

    async removeAll(keys: (string | null)[]): Promise<void> {
        await Promise.all(
            keys.flatMap((key) => (key ? [this.mediaStorage.remove(key)] : [])),
        );
    }
}
