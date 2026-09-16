import type { Pool, PoolClient } from "pg";

import type {
    ShoppingListIngredientInput,
    ShoppingListItemInput,
    ShoppingListItemRow,
} from "domain/repositories/ShoppingListRepository";

interface ListTotals {
    total: number;
    last_position: number;
}

// the person row lock serializes one user's list writes, so the size limit and the next position can't race;
// NO KEY UPDATE leaves foreign-key inserts into other person-owned tables unblocked
async function inPersonListTransaction<T>(
    pool: Pool,
    personId: number,
    work: (client: PoolClient) => Promise<{ commit: boolean; result: T }>,
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query(
            `SELECT 1 FROM person WHERE id = $1 FOR NO KEY UPDATE`,
            [personId],
        );

        const { commit, result } = await work(client);

        await client.query(commit ? "COMMIT" : "ROLLBACK");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function readTotals(
    client: PoolClient,
    personId: number,
): Promise<ListTotals> {
    const result = await client.query<ListTotals>(
        `SELECT COUNT(*)::int AS total, COALESCE(MAX(position), -1)::int AS last_position
         FROM shopping_list_items WHERE person_id = $1`,
        [personId],
    );

    return result.rows[0];
}

export function addItem(
    pool: Pool,
    personId: number,
    item: ShoppingListItemInput,
    maxItems: number,
): Promise<ShoppingListItemRow | null> {
    return inPersonListTransaction(pool, personId, async (client) => {
        const { total, last_position } = await readTotals(client, personId);

        if (total >= maxItems) {
            return { commit: false, result: null };
        }

        const inserted = await client.query<ShoppingListItemRow>(
            `INSERT INTO shopping_list_items (person_id, name, note, position)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, note, ingredient_id, NULL::text AS ingredient_slug,
                       NULL::text AS unit_name, quantity, checked, position`,
            [personId, item.name, item.note, last_position + 1],
        );

        return { commit: true, result: inserted.rows[0] };
    });
}

export function reorder(
    pool: Pool,
    personId: number,
    ids: number[],
): Promise<boolean> {
    return inPersonListTransaction(pool, personId, async (client) => {
        const current = await client.query<{ id: number }>(
            `SELECT id FROM shopping_list_items WHERE person_id = $1`,
            [personId],
        );
        const currentIds = new Set(current.rows.map((row) => row.id));
        const matchesCurrentList =
            ids.length === currentIds.size &&
            ids.every((id) => currentIds.has(id));

        if (!matchesCurrentList) {
            return { commit: false, result: false };
        }

        await client.query(
            `UPDATE shopping_list_items s
             SET position = input.ord - 1
             FROM unnest($2::int[]) WITH ORDINALITY AS input(id, ord)
             WHERE s.id = input.id AND s.person_id = $1`,
            [personId, ids],
        );

        return { commit: true, result: true };
    });
}

export function addIngredients(
    pool: Pool,
    personId: number,
    items: ShoppingListIngredientInput[],
    maxItems: number,
): Promise<boolean> {
    return inPersonListTransaction(pool, personId, async (client) => {
        const merged = await client.query<{ ingredient_id: number }>(
            `UPDATE shopping_list_items s
             SET quantity = GREATEST(COALESCE(s.quantity, 0), input.quantity)
             FROM unnest($2::int[], $3::float8[]) AS input(ingredient_id, quantity)
             WHERE s.person_id = $1 AND s.ingredient_id = input.ingredient_id AND NOT s.checked
             RETURNING s.ingredient_id`,
            [
                personId,
                items.map((item) => item.ingredient_id),
                items.map((item) => item.quantity),
            ],
        );
        const mergedIds = new Set(merged.rows.map((row) => row.ingredient_id));
        const newItems = items.filter(
            (item) => !mergedIds.has(item.ingredient_id),
        );
        const { total, last_position } = await readTotals(client, personId);

        if (total + newItems.length > maxItems) {
            return { commit: false, result: false };
        }

        await client.query(
            `INSERT INTO shopping_list_items (person_id, name, ingredient_id, quantity, position)
             SELECT $1, i.name, input.ingredient_id, input.quantity, $4 + input.ord
             FROM unnest($2::int[], $3::float8[]) WITH ORDINALITY AS input(ingredient_id, quantity, ord)
             JOIN ingredients i ON i.id = input.ingredient_id
             ORDER BY input.ord`,
            [
                personId,
                newItems.map((item) => item.ingredient_id),
                newItems.map((item) => item.quantity),
                last_position,
            ],
        );

        return { commit: true, result: true };
    });
}
