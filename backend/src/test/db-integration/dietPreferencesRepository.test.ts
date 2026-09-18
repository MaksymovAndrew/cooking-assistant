import type { Pool } from "pg";

import Recipe from "domain/entities/Recipe";

import PgDietPreferencesRepository from "infrastructure/persistence/pg/PgDietPreferencesRepository";
import PgFavouriteRepository from "infrastructure/persistence/pg/PgFavouriteRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import {
    createIngredient,
    createPerson,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface FlaggedRow {
    id: number;
    containsAvoided: boolean | null;
}

// targets the idempotent writes, the per-viewer containsAvoided flag, both diet filters and the ranking
// that sinks avoided recipes below the rest
describe("PgDietPreferencesRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgDietPreferencesRepository;
    let recipeRepository: PgRecipeRepository;
    let favouriteRepository: PgFavouriteRepository;
    let userRepository: PgUserRepository;
    let unitId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgDietPreferencesRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        favouriteRepository = new PgFavouriteRepository(pool);
        userRepository = new PgUserRepository(pool);
        unitId = await createUnitMeasurement(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createRecipe(
        ownerId: number,
        title: string,
        ingredientIds: number[],
    ): Promise<number> {
        const recipe = Recipe.forCreation({
            title,
            content: "Diet fixture.",
            person_id: ownerId,
            ingredients: ingredientIds.map((id) => ({
                id,
                quantity_recipe_ingredients: 1,
            })),
        });
        const { id } = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return id;
    }

    it("should store each allergen and ingredient once even when added twice", async () => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addAllergen(personId, "milk");
        await repository.addAllergen(personId, "milk");
        await repository.addAllergen(personId, "gluten");
        const first = await repository.addIngredient(personId, ingredientId);
        const second = await repository.addIngredient(personId, ingredientId);

        expect(first).toBe("added");
        expect(second).toBe("added");
        expect(await repository.findByPerson(personId)).toEqual({
            allergens: ["milk", "gluten"],
            ingredient_ids: [ingredientId],
        });
    });

    it("should report a missing ingredient as not found without inserting anything", async () => {
        const personId = await createPerson(pool);

        const found = await repository.addIngredient(personId, 999_999_999);

        expect(found).toBe("ingredient_not_found");
        expect(await repository.findByPerson(personId)).toEqual({
            allergens: [],
            ingredient_ids: [],
        });
    });

    it("should remove what was avoided and treat removing a missing entry as a no-op", async () => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);

        await repository.addAllergen(personId, "eggs");
        await repository.addIngredient(personId, ingredientId);
        await repository.removeAllergen(personId, "eggs");
        await repository.removeAllergen(personId, "eggs");
        await repository.removeIngredient(personId, ingredientId);
        await repository.removeIngredient(personId, ingredientId);

        expect(await repository.findByPerson(personId)).toEqual({
            allergens: [],
            ingredient_ids: [],
        });
    });

    it("should flag containsAvoided per viewer through an ingredient or its allergen, and null for a guest", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Flagged");
        const plainId = await createIngredient(pool, unitId);
        const dislikedId = await createIngredient(pool, unitId);
        const milkyId = await createIngredient(pool, unitId, ["milk"]);
        const plainRecipeId = await createRecipe(ownerId, `${prefix} A`, [
            plainId,
        ]);
        const dislikedRecipeId = await createRecipe(ownerId, `${prefix} B`, [
            plainId,
            dislikedId,
        ]);
        const milkyRecipeId = await createRecipe(ownerId, `${prefix} C`, [
            milkyId,
        ]);

        await repository.addIngredient(viewerId, dislikedId);
        await repository.addAllergen(viewerId, "milk");

        const asViewer = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
        });
        const asOwner = await recipeRepository.search(ownerId, {
            recipe_name: prefix,
        });
        const asGuest = await recipeRepository.search(null, {
            recipe_name: prefix,
        });
        const detailAsViewer = (await recipeRepository.findByIdWithIngredients(
            milkyRecipeId,
            viewerId,
        )) as FlaggedRow;
        const detailAsGuest = (await recipeRepository.findByIdWithIngredients(
            milkyRecipeId,
            null,
        )) as FlaggedRow;

        expect(
            asViewer.items.map((row) => [row.id, row.containsAvoided]),
        ).toEqual([
            [plainRecipeId, false],
            [milkyRecipeId, true],
            [dislikedRecipeId, true],
        ]);
        expect(asOwner.items.map((row) => row.containsAvoided)).toEqual([
            false,
            false,
            false,
        ]);
        expect(asGuest.items.map((row) => row.containsAvoided)).toEqual([
            null,
            null,
            null,
        ]);
        expect(detailAsViewer.containsAvoided).toBe(true);
        expect(detailAsGuest.containsAvoided).toBeNull();
    });

    it("should rank favourites first and avoided recipes last, keeping favourites ahead among the avoided", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Ranked");
        const plainId = await createIngredient(pool, unitId);
        const avoidedId = await createIngredient(pool, unitId);
        const avoidedFavouriteId = await createRecipe(ownerId, `${prefix} A`, [
            avoidedId,
        ]);
        const avoidedPlainId = await createRecipe(ownerId, `${prefix} B`, [
            avoidedId,
        ]);
        const favouriteId = await createRecipe(ownerId, `${prefix} C`, [
            plainId,
        ]);
        const plainRecipeId = await createRecipe(ownerId, `${prefix} D`, [
            plainId,
        ]);

        await repository.addIngredient(viewerId, avoidedId);
        await favouriteRepository.add(viewerId, "recipe", avoidedFavouriteId);
        await favouriteRepository.add(viewerId, "recipe", favouriteId);

        const ranked = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
        });
        const byCookingTime = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
            sort_order: "asc",
        });

        expect(ranked.items.map((row) => row.id)).toEqual([
            favouriteId,
            plainRecipeId,
            avoidedFavouriteId,
            avoidedPlainId,
        ]);
        expect(byCookingTime.items.map((row) => row.id)).toEqual([
            plainRecipeId,
            favouriteId,
            avoidedPlainId,
            avoidedFavouriteId,
        ]);
    });

    it("should hide avoided recipes and exclude recipes by allergen", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Filtered");
        const plainId = await createIngredient(pool, unitId);
        const glutenId = await createIngredient(pool, unitId, ["gluten"]);
        const sesameId = await createIngredient(pool, unitId, ["sesame"]);
        const plainRecipeId = await createRecipe(ownerId, `${prefix} A`, [
            plainId,
        ]);
        const glutenRecipeId = await createRecipe(ownerId, `${prefix} B`, [
            plainId,
            glutenId,
        ]);

        await createRecipe(ownerId, `${prefix} C`, [sesameId]);
        await repository.addAllergen(viewerId, "sesame");

        const hidden = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
            hide_avoided: true,
        });
        const excluded = await recipeRepository.search(null, {
            recipe_name: prefix,
            exclude_allergens: ["gluten", "sesame"],
        });

        expect(hidden.items.map((row) => row.id)).toEqual([
            glutenRecipeId,
            plainRecipeId,
        ]);
        expect(hidden.total).toBe(2);
        expect(excluded.items.map((row) => row.id)).toEqual([plainRecipeId]);
    });

    it("should report a missing person instead of failing on the foreign key", async () => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);

        await pool.query(`DELETE FROM person WHERE id = $1`, [personId]);

        expect(await repository.addAllergen(personId, "milk")).toBe(false);
        expect(await repository.addIngredient(personId, ingredientId)).toBe(
            "person_not_found",
        );
    });

    it("should drop the avoid list with its owner's account and with a deleted ingredient", async () => {
        const personId = await createPerson(pool);
        const ingredientId = await createIngredient(pool, unitId);
        const otherId = await createPerson(pool);

        await repository.addAllergen(personId, "fish");
        await repository.addIngredient(personId, ingredientId);
        await repository.addIngredient(otherId, ingredientId);
        await pool.query(`DELETE FROM ingredients WHERE id = $1`, [
            ingredientId,
        ]);
        await userRepository.delete(personId);

        const remaining = await pool.query<{ count: number }>(
            `SELECT (
                 (SELECT COUNT(*) FROM person_avoided_allergens WHERE person_id = $1)
               + (SELECT COUNT(*) FROM person_avoided_ingredients WHERE person_id IN ($1, $2)))::int AS count`,
            [personId, otherId],
        );

        expect(remaining.rows[0].count).toBe(0);
    });
});
