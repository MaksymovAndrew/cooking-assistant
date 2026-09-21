import type {
    PhotoRepository,
    PhotoTarget,
} from "domain/repositories/PhotoRepository";

import type { MediaStorage } from "application/ports/MediaStorage";

// deleting a record deletes its files: the keys are read before the row goes, and the files are
// removed only after it is gone, so a failed delete never leaves a record pointing at nothing
export default class PhotoCleanup {
    constructor(
        private photoRepository: Pick<
            PhotoRepository,
            "findKey" | "listOwnedKeys"
        >,
        private mediaStorage: Pick<MediaStorage, "remove">,
    ) {}

    keyOf(
        personId: number,
        target: PhotoTarget,
        targetId: number,
    ): Promise<string | null> {
        return this.photoRepository.findKey(personId, target, targetId);
    }

    keysOwnedBy(personId: number): Promise<string[]> {
        return this.photoRepository.listOwnedKeys(personId);
    }

    async removeAll(keys: (string | null)[]): Promise<void> {
        await Promise.all(
            keys.flatMap((key) => (key ? [this.mediaStorage.remove(key)] : [])),
        );
    }
}
