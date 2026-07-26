import type { IngredientRepository } from "domain/repositories/IngredientRepository";

export default class GetAllIngredients {
    constructor(
        private ingredientRepository: Pick<IngredientRepository, "findAll">,
    ) {}

    async execute(): Promise<unknown[]> {
        return this.ingredientRepository.findAll();
    }
}
