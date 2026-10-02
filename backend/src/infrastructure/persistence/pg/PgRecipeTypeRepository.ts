import type { Pool } from "pg";

import type {
    RecipeType,
    RecipeTypeRepository,
} from "domain/repositories/RecipeTypeRepository";

export default class PgRecipeTypeRepository implements RecipeTypeRepository {
    constructor(private pool: Pool) {}

    async findAll(): Promise<RecipeType[]> {
        const result = await this.pool.query<RecipeType>(
            `SELECT id, type_name, description FROM recipe_types`,
        );

        return result.rows;
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.pool.query<{ found: boolean }>(
            `SELECT EXISTS (SELECT 1 FROM recipe_types WHERE id = $1) AS found`,
            [id],
        );

        return result.rows[0]?.found ?? false;
    }
}
