import type { MediaStorage } from "application/ports/MediaStorage";

// deleting a record deletes its files: the delete itself hands back the keys, and the files are
// removed only after it is gone, so a failed delete never leaves a record pointing at nothing
export default class PhotoCleanup {
    constructor(private mediaStorage: Pick<MediaStorage, "remove">) {}

    async removeAll(keys: (string | null)[]): Promise<void> {
        await Promise.all(
            keys.flatMap((key) => (key ? [this.mediaStorage.remove(key)] : [])),
        );
    }
}
