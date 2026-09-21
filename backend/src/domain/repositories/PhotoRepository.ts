export type PhotoTarget = "recipe" | "menu" | "avatar";

export interface PhotoSwap {
    previousKey: string | null;
}

export interface PhotoRepository {
    // null when the record doesn't exist or belongs to someone else, so the caller answers 404
    replace(
        personId: number,
        target: PhotoTarget,
        targetId: number,
        key: string | null,
    ): Promise<PhotoSwap | null>;
    findKey(
        personId: number,
        target: PhotoTarget,
        targetId: number,
    ): Promise<string | null>;
    // every photo an account owns across all targets, for cleanup when the account is deleted
    listOwnedKeys(personId: number): Promise<string[]>;
}
