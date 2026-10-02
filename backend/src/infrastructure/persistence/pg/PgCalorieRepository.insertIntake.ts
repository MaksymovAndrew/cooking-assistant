import type { Pool, PoolClient } from "pg";

import type {
    CalorieIntakeEntry,
    CalorieIntakeRow,
} from "domain/repositories/CalorieRepository";

// takes a transaction's client too, so cooking can log calories in the same commit as the pantry write
export async function insertIntake(
    executor: Pool | PoolClient,
    personId: number,
    entry: CalorieIntakeEntry,
): Promise<CalorieIntakeRow> {
    const result = await executor.query<CalorieIntakeRow>(
        `INSERT INTO calorie_intake (person_id, recipe_id, menu_id, title, portions, calories)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
            personId,
            entry.recipe_id ?? null,
            entry.menu_id ?? null,
            entry.title,
            entry.portions,
            entry.calories,
        ],
    );

    return result.rows[0];
}
