import type { Pool } from "pg";

interface RecipeStatRow {
    id: number;
    title: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    typeName: string | null;
}

interface TypeStatRow {
    typeName: string;
    count: number;
}

interface IngredientCountRow {
    id: number;
    title: string;
    person_id: number;
    type_id: number | null;
    creation_date: Date;
    cooking_time: number | null;
    ingredient_count: number;
}

interface AvgCookingTimeRow {
    typeName: string;
    averageCookingTime: number;
}

export async function getRecipeStats(pool: Pool): Promise<unknown> {
    // the six aggregates are independent, so run them in parallel
    const [
        { rows: fastestRecipe },
        { rows: slowestRecipe },
        { rows: typeStats },
        { rows: recipesWithMostIngredients },
        { rows: recipesWithLeastIngredients },
        { rows: averageCookingTimes },
    ] = await Promise.all([
        pool.query<RecipeStatRow>(
            `SELECT r.*, rt.type_name as "typeName"
           FROM recipes r
                  JOIN recipe_types rt ON r.type_id = rt.id
           WHERE r.cooking_time = (
             SELECT MIN(cooking_time)
             FROM recipes
           )`,
        ),
        pool.query<RecipeStatRow>(
            `SELECT r.*, rt.type_name as "typeName"
           FROM recipes r
                  JOIN recipe_types rt ON r.type_id = rt.id
           WHERE r.cooking_time = (
             SELECT MAX(cooking_time)
             FROM recipes
           )`,
        ),
        pool.query<TypeStatRow>(
            `SELECT rt.type_name as "typeName", COUNT(*) as count
           FROM recipes r
             JOIN recipe_types rt ON r.type_id = rt.id
           GROUP BY rt.type_name`,
        ),
        pool.query<IngredientCountRow>(
            `SELECT r.*, COUNT(ri.ingredient_id) as ingredient_count
           FROM recipes r
                  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
           GROUP BY r.id
           HAVING COUNT(ri.ingredient_id) = (
             SELECT MAX(ingredient_count)
             FROM (
                    SELECT COUNT(ri.ingredient_id) as ingredient_count
                    FROM recipes r
                           JOIN recipe_ingredients ri ON r.id = ri.recipe_id
                    GROUP BY r.id
                  ) subquery
           )`,
        ),
        pool.query<IngredientCountRow>(
            `SELECT r.*, COUNT(ri.ingredient_id) as ingredient_count
           FROM recipes r
                  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
           GROUP BY r.id
           HAVING COUNT(ri.ingredient_id) = (
             SELECT MIN(ingredient_count)
             FROM (
                    SELECT COUNT(ri.ingredient_id) as ingredient_count
                    FROM recipes r
                           JOIN recipe_ingredients ri ON r.id = ri.recipe_id
                    GROUP BY r.id
                  ) subquery
           )`,
        ),
        pool.query<AvgCookingTimeRow>(
            `SELECT rt.type_name as "typeName",
              AVG(r.cooking_time) as "averageCookingTime"
         FROM recipes r
         JOIN recipe_types rt ON r.type_id = rt.id
         GROUP BY rt.type_name`,
        ),
    ]);

    return {
        fastestRecipe,
        slowestRecipe,
        typeStats,
        recipesWithMostIngredients,
        recipesWithLeastIngredients,
        averageCookingTimes,
    };
}
