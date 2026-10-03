export type PhotoTarget = "recipe" | "menu" | "avatar";

export interface PhotoSwap {
    previousKey: string | null;
}

// read under the delete's own lock, so an upload racing it cannot orphan a file
export interface DeletedRecord {
    photoKey: string | null;
}

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
    // null when the record doesn't exist or belongs to someone else
    replace(
        personId: number,
        target: PhotoTarget,
        targetId: number,
        key: string | null,
    ): Promise<PhotoSwap | null>;
}
