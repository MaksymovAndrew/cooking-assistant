import { Pool } from "pg";

import { config } from "config/env";
import { logger } from "config/logger";

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
            ('teaspoon', 5),
            ('tablespoon', 15),
            ('cup', 250),
            ('pcs', NULL)
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

const seedIngredients = `
    INSERT INTO ingredients (name, id_unit_measurement, allergens, days_to_expire, seasonality, storage_condition)
    SELECT v.name, u.id, v.allergens, v.days_to_expire, v.seasonality, v.storage_condition
    FROM (
        VALUES
            ('Potato', 'pcs', 'None', 30, 'All seasons', 'Dry place, room temperature'),
            ('Carrot', 'g', 'None', 14, 'All seasons', 'Dry place, room temperature'),
            ('Onion', 'pcs', 'None', 30, 'All seasons', 'Dry place, room temperature'),
            ('Tomato', 'pcs', 'None', 7, 'Summer, Autumn', '+4 - +8°C'),
            ('Cucumber', 'pcs', 'None', 7, 'Summer, Autumn', '+4 - +8°C'),
            ('Water', 'ml', 'None', 365, 'All seasons', 'Room temperature'),
            ('Tea', 'g', 'None', 730, 'All seasons', 'Dry place, room temperature'),
            ('Lemon', 'pcs', 'None', 21, 'Winter, Spring', '+4 - +8°C'),
            ('Basil', 'g', 'None', 7, 'Summer', '+4 - +8°C'),
            ('Garlic', 'pcs', 'None', 60, 'All seasons', 'Dry place, room temperature'),
            ('Mushrooms', 'g', 'None', 7, 'All seasons', '+4 - +8°C'),
            ('Sour cream', 'ml', 'Dairy', 14, 'All seasons', '+4 - +8°C'),
            ('Chicken fillet', 'g', 'Poultry', 2, 'All seasons', '+4 - +8°C'),
            ('Milk', 'ml', 'Dairy', 7, 'All seasons', '+4 - +8°C'),
            ('Honey', 'ml', 'None', 1095, 'All seasons', 'Room temperature'),
            ('Flour', 'g', 'Gluten', 365, 'All seasons', 'Dry place, room temperature'),
            ('Sugar', 'g', 'None', 1825, 'All seasons', 'Dry place, room temperature'),
            ('Rice', 'g', 'None', 730, 'All seasons', 'Dry place, room temperature'),
            ('Cheese', 'g', 'Dairy', 30, 'All seasons', '+4 - +8°C'),
            ('Pepper', 'g', 'None', 1095, 'All seasons', 'Dry place, room temperature'),
            ('Pasta', 'g', 'Gluten', 730, 'All seasons', 'Dry place, room temperature'),
            ('Olive oil', 'ml', 'None', 730, 'All seasons', 'Dark place, room temperature')
    ) AS v (name, unit, allergens, days_to_expire, seasonality, storage_condition)
    JOIN unit_measurement u ON u.unit_name = v.unit
    ON CONFLICT (name) DO NOTHING;
`;

export async function runSeed(): Promise<void> {
    const pool = new Pool(config.db);

    try {
        const steps: { label: string; sql: string }[] = [
            { label: "unit_measurement", sql: seedUnitMeasurements },
            { label: "recipe_types", sql: seedRecipeTypes },
            { label: "menu_category", sql: seedMenuCategories },
            { label: "ingredients", sql: seedIngredients },
        ];

        for (const step of steps) {
            const result = await pool.query(step.sql);

            logger.info({ inserted: result.rowCount }, `Seeded ${step.label}`);
        }
    } finally {
        await pool.end();
    }
}
