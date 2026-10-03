import type { Pool } from "pg";

import type {
    CalorieGoal,
    CalorieIntakeEntry,
    CalorieIntakeRow,
    CalorieRepository,
    CalorieSourceInfo,
} from "domain/repositories/CalorieRepository";

import { caloriesPerPortion, menuCaloriesTotal } from "./calorieColumns";
import { insertIntake } from "./PgCalorieRepository.insertIntake";

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
        return insertIntake(this.pool, personId, entry);
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
            `SELECT r.title, ${caloriesPerPortion("r")} AS calories
             FROM recipes r WHERE r.id = $1`,
            [recipeId],
        );

        return result.rows[0] ?? null;
    }

    // LEFT JOINs: a menu without recipes still yields a row, telling "no calories" from "no menu"
    async findMenuCalories(menuId: number): Promise<CalorieSourceInfo | null> {
        const result = await this.pool.query<CalorieSourceInfo>(
            `SELECT m.menu_title AS title,
                    ${menuCaloriesTotal("r")} AS calories
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
