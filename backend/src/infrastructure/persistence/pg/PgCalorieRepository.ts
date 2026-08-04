import type { Pool } from "pg";

import type {
    CalorieGoal,
    CalorieIntakeEntry,
    CalorieIntakeRow,
    CalorieRepository,
    CalorieSourceInfo,
} from "domain/repositories/CalorieRepository";

export default class PgCalorieRepository implements CalorieRepository {
    constructor(private pool: Pool) {}

    async findIntake(
        personId: number,
        from: string,
        to: string,
    ): Promise<CalorieIntakeRow[]> {
        const result = await this.pool.query<CalorieIntakeRow>(
            `SELECT * FROM calorie_intake
             WHERE person_id = $1 AND eaten_at >= $2 AND eaten_at <= $3
             ORDER BY eaten_at DESC`,
            [personId, from, to],
        );

        return result.rows;
    }

    async logIntake(
        personId: number,
        entry: CalorieIntakeEntry,
    ): Promise<CalorieIntakeRow> {
        const result = await this.pool.query<CalorieIntakeRow>(
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

    async deleteIntake(personId: number, intakeId: number): Promise<boolean> {
        const result = await this.pool.query(
            `DELETE FROM calorie_intake WHERE id = $1 AND person_id = $2`,
            [intakeId, personId],
        );

        return (result.rowCount ?? 0) > 0;
    }

    async findRecipeCalories(
        recipeId: number,
    ): Promise<CalorieSourceInfo | null> {
        const result = await this.pool.query<CalorieSourceInfo>(
            `SELECT title, COALESCE(calories_override, calories_computed) AS calories
             FROM recipes WHERE id = $1`,
            [recipeId],
        );

        return result.rows[0] ?? null;
    }

    // LEFT JOINs so a menu with zero recipes still returns one row (calories: null), not zero rows -
    // that's what tells LogIntake "menu exists but has no calorie info" apart from "menu doesn't exist".
    // plain SUM() would silently ignore a NULL term from any one recipe with unknown calories,
    // undercounting the menu instead of reporting it as unavailable like the per-recipe path does -
    // the CASE forces the whole total to NULL the moment any linked recipe's calories are unknown
    async findMenuCalories(menuId: number): Promise<CalorieSourceInfo | null> {
        const result = await this.pool.query<CalorieSourceInfo>(
            `SELECT m.menu_title AS title,
                    CASE
                        WHEN bool_or(r.id IS NOT NULL AND COALESCE(r.calories_override, r.calories_computed) IS NULL)
                            THEN NULL
                        ELSE SUM(COALESCE(r.calories_override, r.calories_computed))
                    END AS calories
             FROM menu m
             LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
             LEFT JOIN recipes r ON r.id = mr.recipe_id
             WHERE m.menu_id = $1
             GROUP BY m.menu_title`,
            [menuId],
        );

        return result.rows[0] ?? null;
    }

    async updateGoal(personId: number, goal: CalorieGoal): Promise<void> {
        await this.pool.query(
            `UPDATE person
             SET calorie_goal = $1
             WHERE id = $2`,
            [goal.calorie_goal, personId],
        );
    }
}
