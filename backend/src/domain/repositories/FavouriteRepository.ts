export type FavouriteTarget = "recipe" | "menu";

export interface FavouriteRepository {
    // false when the recipe or menu itself doesn't exist, so the caller answers 404 instead of a foreign-key 500
    add(
        personId: number,
        target: FavouriteTarget,
        targetId: number,
    ): Promise<boolean>;
    remove(
        personId: number,
        target: FavouriteTarget,
        targetId: number,
    ): Promise<void>;
}
