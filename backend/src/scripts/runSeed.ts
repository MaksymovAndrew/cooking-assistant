import { Pool } from "pg";

import { config } from "config/env";
import { logger } from "config/logger";

import { seedIngredientsFromCatalog } from "./seedIngredientsFromCatalog";

// idempotent reference + sample data; safe to re-run (guards against existing rows)
const seedUnitMeasurements = `
    INSERT INTO unit_measurement (unit_name, coefficient)
    SELECT v.unit_name, v.coefficient
    FROM (
        VALUES
            ('g', 1::double precision),
            ('kg', 1000),
            ('ml', 1),
            ('l', 1000),
            ('tsp', 5),
            ('tbsp', 15),
            ('piece', NULL),
            ('clove', NULL),
            ('bunch', NULL),
            ('sprig', NULL),
            ('slice', NULL),
            ('head', NULL),
            ('can', NULL),
            ('package', NULL)
    ) AS v (unit_name, coefficient)
    WHERE NOT EXISTS (
        SELECT 1 FROM unit_measurement m WHERE m.unit_name = v.unit_name
    );
`;

const seedRecipeTypes = `
    INSERT INTO recipe_types (type_name, description)
    SELECT v.type_name, v.description
    FROM (
        VALUES
            ('First course', '"First course" includes various soups, broths, and light appetizers that not only warm the soul but also stimulate the appetite.'),
            ('Main course', 'The Main course is the foundation of a hearty meal. These are meat, fish, or vegetable dishes that provide energy and a feeling of satisfaction after eating.'),
            ('Dessert', 'Dessert is the sweet finale of a culinary journey. Cakes, pies, pastries, and other treats create unforgettable moments of pleasure for all sweet lovers.'),
            ('Drink', 'Drinks are a complement to any dish. They can be hot, cold, refreshing, or invigorating, enhancing flavors and adding completeness to the meal.')
    ) AS v (type_name, description)
    WHERE NOT EXISTS (
        SELECT 1 FROM recipe_types t WHERE t.type_name = v.type_name
    );
`;

// re-syncs every recipe's stored calorie total with the catalog values the step above just
// upserted, so a changed ingredient calorie value doesn't leave recipes' totals stale
const recomputeRecipeCalories = `
    UPDATE recipes r SET calories_computed = (
        SELECT SUM(ri.quantity_recipe_ingredients * i.calories_per_unit)
        FROM recipe_ingredients ri
                 JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE ri.recipe_id = r.id
    );
`;

const seedMenuCategories = `
    INSERT INTO menu_category (category_name, category_description)
    SELECT v.category_name, v.category_description
    FROM (
        VALUES
            ('Breakfast', 'Dishes for the morning meal that provide energy for the whole day.'),
            ('Lunch', 'Hearty dishes for the midday meal'),
            ('Dinner', 'Light or nourishing dishes for the evening meal')
    ) AS v (category_name, category_description)
    WHERE NOT EXISTS (
        SELECT 1 FROM menu_category c WHERE c.category_name = v.category_name
    );
`;

export async function runSeed(): Promise<void> {
    const pool = new Pool(config.db);

    try {
        const steps: { label: string; sql: string }[] = [
            { label: "unit_measurement", sql: seedUnitMeasurements },
            { label: "recipe_types", sql: seedRecipeTypes },
            { label: "menu_category", sql: seedMenuCategories },
        ];

        for (const step of steps) {
            const result = await pool.query(step.sql);

            logger.info({ inserted: result.rowCount }, `Seeded ${step.label}`);
        }

        const ingredientsAffected = await seedIngredientsFromCatalog(pool);

        logger.info(
            { affected: ingredientsAffected },
            "Seeded ingredients from catalog",
        );

        const recomputeResult = await pool.query(recomputeRecipeCalories);

        logger.info(
            { affected: recomputeResult.rowCount },
            "Recomputed recipe calorie totals",
        );
    } finally {
        await pool.end();
    }
}
