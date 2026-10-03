import type { Pool } from "pg";

import type {
    AverageTimeByCategory,
    MenuCalorieEntry,
    MenuCategoryStat,
    MenuStatisticsDto,
    MenuStatsEntry,
} from "domain/repositories/menuStats.types";

import { menuCaloriesTotal } from "./calorieColumns";

// interpolated, never bound: fixed literals, so no request value can reach the SQL
type SortDirection = "ASC" | "DESC";
type SummaryColumn = "total_cooking_time" | "recipe_count" | "total_calories";

const EXTREMES_LIMIT = 3;

const MENU_SUMMARY = `
    WITH summary AS (
        SELECT m.menu_id AS id,
               m.menu_title AS title,
               mc.category_name AS "categoryName",
               COUNT(mr.recipe_id)::int AS recipe_count,
               COALESCE(SUM(r.cooking_time), 0)::int AS total_cooking_time,
               ${menuCaloriesTotal("r")} AS total_calories
        FROM menu m
                 JOIN menu_category mc ON mc.menu_category_id = m.category_id
                 LEFT JOIN menu_recipe mr ON mr.menu_id = m.menu_id
                 LEFT JOIN recipes r ON r.id = mr.recipe_id
        GROUP BY m.menu_id, mc.category_name
    ),
    categories AS (
        SELECT "categoryName",
               COUNT(*)::int AS "menuCount",
               ROUND(AVG(total_cooking_time))::int AS "averageTotalTime"
        FROM summary
        GROUP BY "categoryName"
    )`;

function extremes(column: SummaryColumn, direction: SortDirection): string {
    return `(
        SELECT COALESCE(json_agg(e ORDER BY e.${column} ${direction}, e.id), '[]')
        FROM (
            SELECT * FROM summary
            WHERE ${column} IS NOT NULL
            ORDER BY ${column} ${direction}, id
            LIMIT ${EXTREMES_LIMIT}
        ) e
    )`;
}

interface StatsRow {
    menusCount: number;
    averageTotalTime: number | null;
    averageRecipesPerMenu: number | null;
    averageCaloriesOverall: number | null;
    categories: (MenuCategoryStat & AverageTimeByCategory)[];
    fastestMenus: MenuStatsEntry[];
    slowestMenus: MenuStatsEntry[];
    mostRecipesMenus: MenuStatsEntry[];
    leastRecipesMenus: MenuStatsEntry[];
    mostCaloricMenus: MenuCalorieEntry[];
    leastCaloricMenus: MenuCalorieEntry[];
}

export async function getMenuStats(pool: Pool): Promise<MenuStatisticsDto> {
    const result = await pool.query<StatsRow>(`
        ${MENU_SUMMARY}
        SELECT
            (SELECT COUNT(*)::int FROM summary) AS "menusCount",
            (SELECT ROUND(AVG(total_cooking_time))::int FROM summary) AS "averageTotalTime",
            (SELECT AVG(recipe_count)::float8 FROM summary) AS "averageRecipesPerMenu",
            (SELECT ROUND(AVG(total_calories))::int FROM summary) AS "averageCaloriesOverall",
            (SELECT COALESCE(json_agg(c ORDER BY c."menuCount" DESC, c."categoryName"), '[]')
             FROM categories c) AS categories,
            ${extremes("total_cooking_time", "ASC")} AS "fastestMenus",
            ${extremes("total_cooking_time", "DESC")} AS "slowestMenus",
            ${extremes("recipe_count", "DESC")} AS "mostRecipesMenus",
            ${extremes("recipe_count", "ASC")} AS "leastRecipesMenus",
            ${extremes("total_calories", "DESC")} AS "mostCaloricMenus",
            ${extremes("total_calories", "ASC")} AS "leastCaloricMenus"
    `);
    const { categories, ...stats } = result.rows[0];
    const menuCountByCategory = categories.map(
        ({ categoryName, menuCount }) => ({ categoryName, menuCount }),
    );

    return {
        ...stats,
        menuCountByCategory,
        // categories come most used first
        mostUsedCategory: menuCountByCategory.at(0) ?? null,
        averageTotalTimeByCategory: categories.map(
            ({ categoryName, averageTotalTime }) => ({
                categoryName,
                averageTotalTime,
            }),
        ),
    };
}
