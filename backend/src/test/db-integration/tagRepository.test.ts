import type { Pool } from "pg";

import { TAG_LIMITS } from "constants/tags";
import Recipe from "domain/entities/Recipe";

import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgTagRepository from "infrastructure/persistence/pg/PgTagRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";

import {
    createIngredient,
    createPerson,
    createUnitMeasurement,
    unique,
} from "./fixtures";
import { createTestPool } from "./testPool";

interface TaggedRow {
    id: number;
    tags: { id: number; name: string }[] | null;
}

const TAG_NAME = "Weeknight";

// targets the case-insensitive name rule, the per-person limit, the replace-set write, the per-viewer
// tags column and the tag filter
describe("PgTagRepository (real Postgres)", () => {
    let pool: Pool;
    let repository: PgTagRepository;
    let recipeRepository: PgRecipeRepository;
    let userRepository: PgUserRepository;
    let unitId: number;
    let ingredientId: number;

    beforeAll(async () => {
        pool = createTestPool();
        repository = new PgTagRepository(pool);
        recipeRepository = new PgRecipeRepository(pool);
        userRepository = new PgUserRepository(pool);
        unitId = await createUnitMeasurement(pool);
        ingredientId = await createIngredient(pool, unitId);
    });

    afterAll(async () => {
        await pool.end();
    });

    async function createRecipe(
        ownerId: number,
        title: string,
    ): Promise<number> {
        const recipe = Recipe.forCreation({
            title,
            content: "Tag fixture.",
            language: "en",
            person_id: ownerId,
            ingredients: [{ id: ingredientId, quantity_recipe_ingredients: 1 }],
        });
        const { id } = (await recipeRepository.create(recipe)) as {
            id: number;
        };

        return id;
    }

    async function createTag(personId: number, name: string): Promise<number> {
        const result = await repository.create(
            personId,
            name,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );

        if (result.outcome !== "created") {
            throw new Error(`Tag fixture failed: ${result.outcome}`);
        }

        return result.tag.id;
    }

    it("should refuse a second tag whose name differs only in case", async () => {
        const personId = await createPerson(pool);

        const created = await repository.create(
            personId,
            TAG_NAME,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );
        const duplicate = await repository.create(
            personId,
            TAG_NAME.toLowerCase(),
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );

        expect(created.outcome).toBe("created");
        expect(duplicate.outcome).toBe("duplicate_name");
        expect(await repository.findByPerson(personId)).toEqual([
            { id: created.tag?.id, name: TAG_NAME },
        ]);
    });

    it("should let two people use the same tag name", async () => {
        const firstPersonId = await createPerson(pool);
        const secondPersonId = await createPerson(pool);

        await createTag(firstPersonId, TAG_NAME);
        const second = await repository.create(
            secondPersonId,
            TAG_NAME,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );

        expect(second.outcome).toBe("created");
    });

    it("should stop creating tags at the limit", async () => {
        const personId = await createPerson(pool);

        await createTag(personId, "Only one");
        const refused = await repository.create(personId, "Second", 1);

        expect(refused.outcome).toBe("limit_reached");
        expect(await repository.findByPerson(personId)).toHaveLength(1);
    });

    it("should report a missing person instead of failing on the foreign key", async () => {
        const personId = await createPerson(pool);

        await pool.query(`DELETE FROM person WHERE id = $1`, [personId]);

        const result = await repository.create(
            personId,
            TAG_NAME,
            TAG_LIMITS.MAX_TAGS_PER_PERSON,
        );

        expect(result.outcome).toBe("person_not_found");
    });

    it("should rename a tag, refuse a name already taken and report another person's tag as missing", async () => {
        const personId = await createPerson(pool);
        const otherPersonId = await createPerson(pool);
        const tagId = await createTag(personId, TAG_NAME);

        await createTag(personId, "Slow");
        const renamed = await repository.rename(personId, tagId, "Fast");
        const duplicate = await repository.rename(personId, tagId, "slow");
        const foreign = await repository.rename(otherPersonId, tagId, "Fast");

        expect(renamed).toBe("renamed");
        expect(duplicate).toBe("duplicate_name");
        expect(foreign).toBe("not_found");
    });

    it("should delete only the owner's tag", async () => {
        const personId = await createPerson(pool);
        const otherPersonId = await createPerson(pool);
        const tagId = await createTag(personId, TAG_NAME);

        expect(await repository.delete(otherPersonId, tagId)).toBe(false);
        expect(await repository.delete(personId, tagId)).toBe(true);
        expect(await repository.findByPerson(personId)).toEqual([]);
    });

    it("should replace the recipe tag set and reject ids the person does not own", async () => {
        const personId = await createPerson(pool);
        const otherPersonId = await createPerson(pool);
        const firstTagId = await createTag(personId, "Alpha");
        const secondTagId = await createTag(personId, "Beta");
        const foreignTagId = await createTag(otherPersonId, "Gamma");
        const recipeId = await createRecipe(personId, unique("Tagged"));

        const saved = await repository.setRecipeTags(personId, recipeId, [
            firstTagId,
            secondTagId,
        ]);
        const replaced = await repository.setRecipeTags(personId, recipeId, [
            secondTagId,
        ]);
        const refused = await repository.setRecipeTags(personId, recipeId, [
            foreignTagId,
        ]);
        const detail = (await recipeRepository.findByIdWithIngredients(
            recipeId,
            personId,
        )) as TaggedRow;

        expect(saved).toBe("saved");
        expect(replaced).toBe("saved");
        expect(refused).toBe("tags_not_found");
        expect(detail.tags).toEqual([{ id: secondTagId, name: "Beta" }]);
    });

    it("should report a missing recipe without touching the links", async () => {
        const personId = await createPerson(pool);
        const tagId = await createTag(personId, TAG_NAME);

        const outcome = await repository.setRecipeTags(personId, 999_999_999, [
            tagId,
        ]);

        expect(outcome).toBe("recipe_not_found");
    });

    it("should show tags per viewer and null for a guest", async () => {
        const ownerId = await createPerson(pool);
        const viewerId = await createPerson(pool);
        const prefix = unique("Viewed");
        const recipeId = await createRecipe(ownerId, `${prefix} A`);
        const viewerTagId = await createTag(viewerId, TAG_NAME);

        await repository.setRecipeTags(viewerId, recipeId, [viewerTagId]);

        const asViewer = await recipeRepository.search(viewerId, {
            recipe_name: prefix,
        });
        const asOwner = await recipeRepository.search(ownerId, {
            recipe_name: prefix,
        });
        const asGuest = await recipeRepository.search(null, {
            recipe_name: prefix,
        });

        expect((asViewer.items as TaggedRow[])[0].tags).toEqual([
            { id: viewerTagId, name: TAG_NAME },
        ]);
        expect((asOwner.items as TaggedRow[])[0].tags).toEqual([]);
        expect((asGuest.items as TaggedRow[])[0].tags).toBeNull();
    });

    it("should filter a search down to the viewer's tagged recipes", async () => {
        const personId = await createPerson(pool);
        const prefix = unique("Filtered");
        const taggedId = await createRecipe(personId, `${prefix} A`);

        await createRecipe(personId, `${prefix} B`);
        const tagId = await createTag(personId, TAG_NAME);

        await repository.setRecipeTags(personId, taggedId, [tagId]);

        const filtered = await recipeRepository.search(personId, {
            recipe_name: prefix,
            tag_ids: String(tagId),
        });

        expect((filtered.items as TaggedRow[]).map((row) => row.id)).toEqual([
            taggedId,
        ]);
    });

    it("should drop a person's tags and their links with the account", async () => {
        const personId = await createPerson(pool);
        const tagId = await createTag(personId, TAG_NAME);
        const recipeId = await createRecipe(personId, unique("Cascaded"));

        await repository.setRecipeTags(personId, recipeId, [tagId]);
        await userRepository.delete(personId);

        const links = await pool.query(
            `SELECT 1 FROM recipe_tag_links WHERE tag_id = $1`,
            [tagId],
        );
        const tags = await pool.query(
            `SELECT 1 FROM person_tags WHERE id = $1`,
            [tagId],
        );

        expect(links.rowCount).toBe(0);
        expect(tags.rowCount).toBe(0);
    });
});
