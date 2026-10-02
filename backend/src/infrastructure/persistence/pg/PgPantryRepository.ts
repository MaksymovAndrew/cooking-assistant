import type { Pool } from "pg";

import type {
    PantryIngredient,
    PantryIngredientInput,
    PantryRepository,
    PurchaseHistoryEntry,
} from "domain/repositories/PantryRepository";

import { inPersonWriteTransaction } from "./personWriteTransaction";
import {
    deletePurchases,
    updatePurchaseQuantity,
} from "./PgPantryRepository.history";
import {
    findIngredientPurchaseHistory,
    findPantryByUser,
} from "./PgPantryRepository.queries";
import { committed, rolledBack } from "./transaction";

// every pantry write takes the person lock, so it never interleaves with a cooking or an undo
export default class PgPantryRepository implements PantryRepository {
    constructor(private pool: Pool) {}

    async findByUser(userId: number): Promise<PantryIngredient[]> {
        return findPantryByUser(this.pool, userId);
    }

    async addIngredients(
        userId: number,
        items: PantryIngredientInput[],
    ): Promise<void> {
        const ingredientIds = items.map((item) => item.id);
        const quantities = items.map((item) => item.quantity_person_ingradient);

        await inPersonWriteTransaction(
            this.pool,
            userId,
            null,
            async (client) => {
                await client.query(
                    `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
           SELECT $1, item.ingredient_id, item.quantity, NOW()
           FROM unnest($2::int[], $3::float8[]) AS item(ingredient_id, quantity)
           ON CONFLICT (person_id, ingredient_id)
           DO UPDATE SET quantity_person_ingradient = person_ingredients.quantity_person_ingradient + EXCLUDED.quantity_person_ingradient,
                         purchase_date = NOW()`,
                    [userId, ingredientIds, quantities],
                );
                await client.query(
                    `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
           SELECT $1, item.ingredient_id, item.quantity, NOW()
           FROM unnest($2::int[], $3::float8[]) AS item(ingredient_id, quantity)`,
                    [userId, ingredientIds, quantities],
                );

                return committed(null);
            },
        );
    }

    async deleteIngredient(
        userId: number,
        ingredientId: number,
    ): Promise<boolean> {
        return inPersonWriteTransaction(
            this.pool,
            userId,
            false,
            async (client) => {
                await client.query(
                    `DELETE FROM ingredient_purchases WHERE person_id = $1 AND ingredient_id = $2`,
                    [userId, ingredientId],
                );

                const result = await client.query(
                    `DELETE FROM person_ingredients WHERE person_id = $1 AND ingredient_id = $2`,
                    [userId, ingredientId],
                );

                return result.rowCount === 0
                    ? rolledBack(false)
                    : committed(true);
            },
        );
    }

    async updatePurchaseQuantity(
        userId: number,
        purchaseId: number,
        quantity: number,
    ): Promise<boolean> {
        return updatePurchaseQuantity(this.pool, userId, purchaseId, quantity);
    }

    async deletePurchases(
        userId: number,
        purchaseIds: number[],
    ): Promise<number> {
        return deletePurchases(this.pool, userId, purchaseIds);
    }

    async findPurchaseHistory(
        userId: number,
        ingredientId: number,
    ): Promise<PurchaseHistoryEntry[]> {
        return findIngredientPurchaseHistory(this.pool, userId, ingredientId);
    }
}
