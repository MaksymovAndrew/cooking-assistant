export interface RecipeType {
    id: number;
    type_name: string;
    description: string | null;
}

export interface RecipeTypeRepository {
    findAll(): Promise<RecipeType[]>;
    exists(id: number): Promise<boolean>;
}
