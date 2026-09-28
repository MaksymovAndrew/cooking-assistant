export type PhotoTarget = "recipe" | "menu" | "avatar";

export interface PhotoSwap {
    previousKey: string | null;
}

// the delete hands back the photo it held, read under the same lock, so an upload racing it cannot orphan a file
export interface DeletedRecord {
    photoKey: string | null;
}

// how many photos the account holds across every target, and whether this record already has one
export interface PhotoUsage {
    count: number;
    targetHasPhoto: boolean;
}

export interface PhotoRepository {
    usage(
        personId: number,
        target: PhotoTarget,
        targetId: number,
    ): Promise<PhotoUsage>;
    // null when the record doesn't exist or belongs to someone else, so the caller answers 404
    replace(
        personId: number,
        target: PhotoTarget,
        targetId: number,
        key: string | null,
    ): Promise<PhotoSwap | null>;
}
