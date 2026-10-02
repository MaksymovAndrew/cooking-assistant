import type { Pool } from "pg";

import type {
    CatalogIngredient,
    IngredientRepository,
} from "domain/repositories/IngredientRepository";

interface IngredientIdRow {
    id: number;
}

export default class PgIngredientRepository implements IngredientRepository {
    constructor(private pool: Pool) {}

    async findAll(): Promise<CatalogIngredient[]> {
        const result = await this.pool.query<CatalogIngredient>(
            `SELECT i.id, i.slug, i.name, i.category, um.unit_name, i.allergens,
                    i.days_to_expire, i.calories_per_unit
               FROM ingredients i
                      LEFT JOIN unit_measurement um ON i.id_unit_measurement = um.id
              ORDER BY i.name`,
        );

        return result.rows;
    }

    async findExistingIds(ids: number[]): Promise<number[]> {
        const result = await this.pool.query<IngredientIdRow>(
            `SELECT id FROM ingredients WHERE id = ANY($1)`,
            [ids],
        );

        return result.rows.map((row) => row.id);
    }
}
