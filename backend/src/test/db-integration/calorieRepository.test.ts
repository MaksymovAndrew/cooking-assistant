import type { Pool } from "pg";

import Menu from "domain/entities/Menu";
import Recipe from "domain/entities/Recipe";

import PgCalorieRepository from "infrastructure/persistence/pg/PgCalorieRepository";
import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import {
    createIngredient,
    createMenuCategory,
    createPerson,
    createUnitMeasurement,
} from "./fixtures";
import { createTestPool } from "./testPool";

// targets recompute-on-write, the calories_override COALESCE, the menu LEFT JOIN sum, and the
// ownership-scoped delete/goal update - all invisible to mocked-repository unit tests
describe("PgCalorieRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgCalorieRepository;
    let recipeRepository: PgRecipeRepository;
    let menuRepository: PgMenuRepository;
    let userRepository: PgUserRepository;
    let personId: number;
    let unitId: number;
    let categoryId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgCalorieRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        menuRepository = new PgMenuRepository(pool);
        userRepository = new PgUserRepository(pool);
        personId = await createPerson(pool);
        unitId = await createUnitMeasurement(pool);
        categoryId = await createMenuCategory(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createRecipeWithCalories(
        caloriesPerUnit: number,
        quantity: number,
    ): Promise<number> {
        const ingredientId = await createIngredient(
            pool,
            unitId,
            [],
            caloriesPerUnit,
        );
        const recipe = Recipe.forCreation({
            title: "Soup",
            content: "Simmer.",
            person_id: personId,
            ingredients: [
                { id: ingredientId, quantity_recipe_ingredients: quantity },
            ],
        });
        const { id } = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return id;
    }

    it("should return the computed calories for a recipe", async () => {
        const recipeId = await createRecipeWithCalories(10.8, 2);

        const found = await repository.findRecipeCalories(recipeId);

        expect(found).toEqual({ title: "Soup", calories: 21.6 });
    });

    it("should prefer the manual override over the computed total", async () => {
        const recipeId = await createRecipeWithCalories(10, 1);
        const ingredientId = await createIngredient(pool, unitId, [], 10);
        const updated = Recipe.forUpdate({
            title: "Soup",
            content: "Simmer, seasoned.",
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
            calories_override: 500,
        });

        await recipeRepository.update(recipeId, personId, updated);
        const found = await repository.findRecipeCalories(recipeId);

        expect(found).toEqual({ title: "Soup", calories: 500 });
    });

    it("should return null for a missing recipe", async () => {
        const found = await repository.findRecipeCalories(999_999_999);

        expect(found).toBeNull();
    });

    it("should sum calories across a menu's recipes", async () => {
        const recipeAId = await createRecipeWithCalories(10, 2);
        const recipeBId = await createRecipeWithCalories(50, 1);
        const menu = Menu.forCreation({
            menuTitle: "Weekend menu",
            menuContent: "Notes.",
            categoryId,
            personId,
            recipeIds: [recipeAId, recipeBId],
        });
        const menuId = (await menuRepository.create(menu, [
            recipeAId,
            recipeBId,
        ])) as number;

        const found = await repository.findMenuCalories(menuId);

        expect(found).toEqual({ title: "Weekend menu", calories: 70 });
    });

    it("should return calories null for a menu with no recipes, and null for a missing menu", async () => {
        const emptyMenu = await pool.query<{ menu_id: number }>(
            `INSERT INTO menu (menu_title, menu_content, category_id, person_id)
             VALUES ($1, $2, $3, $4) RETURNING menu_id`,
            ["Empty menu", "Notes.", categoryId, personId],
        );

        const found = await repository.findMenuCalories(
            emptyMenu.rows[0].menu_id,
        );
        const missing = await repository.findMenuCalories(999_999_999);

        expect(found).toEqual({ title: "Empty menu", calories: null });
        expect(missing).toBeNull();
    });

    it("should log intake and find it within the requested range, excluding entries outside it", async () => {
        const recipeId = await createRecipeWithCalories(20, 1);

        const logged = await repository.logIntake(personId, {
            recipe_id: recipeId,
            title: "Soup",
            portions: 2,
            calories: 40,
        });

        const withinRange = await repository.findIntake(
            personId,
            new Date(Date.now() - 60_000).toISOString(),
            new Date(Date.now() + 60_000).toISOString(),
        );
        const outsideRange = await repository.findIntake(
            personId,
            "2000-01-01T00:00:00.000Z",
            "2000-01-02T00:00:00.000Z",
        );

        expect(withinRange.map((entry) => entry.id)).toContain(logged.id);
        expect(outsideRange.map((entry) => entry.id)).not.toContain(logged.id);
    });

    it("should delete an intake entry only for its owner", async () => {
        const otherPersonId = await createPerson(pool);
        const recipeId = await createRecipeWithCalories(20, 1);
        const logged = await repository.logIntake(personId, {
            recipe_id: recipeId,
            title: "Soup",
            portions: 1,
            calories: 20,
        });

        const deletedByOther = await repository.deleteIntake(
            otherPersonId,
            logged.id,
        );
        const deletedByOwner = await repository.deleteIntake(
            personId,
            logged.id,
        );

        expect(deletedByOther).toBe(false);
        expect(deletedByOwner).toBe(true);
    });

    it("should update and clear the calorie goal", async () => {
        await repository.updateGoal(personId, {
            calorie_goal: 2000,
            calorie_goal_period: "day",
            meal_calorie_limit: 800,
        });

        const withGoal = await userRepository.findById(personId);

        expect(withGoal).toEqual(
            expect.objectContaining({
                calorie_goal: 2000,
                calorie_goal_period: "day",
                meal_calorie_limit: 800,
            }),
        );

        await repository.updateGoal(personId, {
            calorie_goal: null,
            calorie_goal_period: null,
            meal_calorie_limit: null,
        });

        const cleared = await userRepository.findById(personId);

        expect(cleared).toEqual(
            expect.objectContaining({
                calorie_goal: null,
                calorie_goal_period: null,
                meal_calorie_limit: null,
            }),
        );
    });
});
