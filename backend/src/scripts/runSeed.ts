import { Pool } from "pg";

import { config } from "config/env";
import { logger } from "config/logger";

import { computedRecipeCalories } from "infrastructure/persistence/pg/calorieColumns";
import {
    committed,
    withTransaction,
} from "infrastructure/persistence/pg/transaction";

import { seedIngredientsFromCatalog } from "./seedIngredientsFromCatalog";

// must stay idempotent: the seed runs on every deploy
const seedUnitMeasurements = `
    INSERT INTO unit_measurement (unit_name, coefficient)
    SELECT v.unit_name, v.coefficient
    FROM (
        VALUES
            ('g', 1::double precision),
            ('kg', 1000),
            ('ml', 1),
            ('L', 1000),
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

// catalog calorie values may have just changed; only totals that moved are rewritten
const recomputeRecipeCalories = `
    UPDATE recipes r SET calories_computed = ${computedRecipeCalories("r.id")}
    WHERE r.calories_computed IS DISTINCT FROM ${computedRecipeCalories("r.id")};
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

const REFERENCE_STEPS = [
    { label: "unit_measurement", sql: seedUnitMeasurements },
    { label: "recipe_types", sql: seedRecipeTypes },
    { label: "menu_category", sql: seedMenuCategories },
];

// one transaction: a seed that fails halfway leaves the reference data as it was
export async function runSeed(): Promise<void> {
    const pool = new Pool(config.db);

    try {
        await withTransaction(pool, async (client) => {
            for (const step of REFERENCE_STEPS) {
                const result = await client.query(step.sql);

                logger.info(
                    { inserted: result.rowCount },
                    `Seeded ${step.label}`,
                );
            }

            const ingredientsAffected =
                await seedIngredientsFromCatalog(client);

            logger.info(
                { affected: ingredientsAffected },
                "Seeded ingredients from catalog",
            );

            const recomputeResult = await client.query(recomputeRecipeCalories);

            logger.info(
                { affected: recomputeResult.rowCount },
                "Recomputed recipe calorie totals",
            );

            return committed(null);
        });
    } finally {
        await pool.end();
    }
}
