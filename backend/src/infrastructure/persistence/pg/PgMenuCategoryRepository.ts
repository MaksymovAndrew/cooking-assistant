import type { Pool } from "pg";

import type {
    MenuCategory,
    MenuCategoryRepository,
} from "domain/repositories/MenuCategoryRepository";

export default class PgMenuCategoryRepository implements MenuCategoryRepository {
    constructor(private pool: Pool) {}

    async findAll(): Promise<MenuCategory[]> {
        const result = await this.pool.query<MenuCategory>(
            `SELECT menu_category_id, category_name, category_description
            FROM menu_category
            ORDER BY category_name`,
        );

        return result.rows;
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.pool.query<{ found: boolean }>(
            `SELECT EXISTS (
                SELECT 1 FROM menu_category WHERE menu_category_id = $1
            ) AS found`,
            [id],
        );

        return result.rows[0]?.found ?? false;
    }
}
