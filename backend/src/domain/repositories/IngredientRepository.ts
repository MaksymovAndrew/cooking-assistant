export interface IngredientRepository {
    findAll(): Promise<unknown[]>;
    findExistingIds(ids: number[]): Promise<number[]>;
}
