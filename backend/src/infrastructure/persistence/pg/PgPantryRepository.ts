import type { Pool } from "pg";

import type {
    PantryIngredientInput,
    PantryRepository,
} from "domain/repositories/PantryRepository";

import {
    findIngredientPurchaseHistory,
    updatePurchaseQuantity,
} from "./PgPantryRepository.history";
import { findPantryByUser } from "./PgPantryRepository.queries";

export default class PgPantryRepository implements PantryRepository {
    constructor(private pool: Pool) {}

    async findByUser(userId: string | number): Promise<unknown[]> {
        return findPantryByUser(this.pool, userId);
    }

    async addIngredients(
        userId: string | number,
        items: PantryIngredientInput[],
    ): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            for (const ingredient of items) {
                await client.query(
                    `INSERT INTO person_ingredients (person_id, ingredient_id, quantity_person_ingradient, purchase_date)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (person_id, ingredient_id)
           DO UPDATE SET quantity_person_ingradient = person_ingredients.quantity_person_ingradient + $3,
                         purchase_date = NOW()`,
                    [
                        userId,
                        ingredient.id,
                        ingredient.quantity_person_ingradient,
                    ],
                );

                await client.query(
                    `INSERT INTO ingredient_purchases (person_id, ingredient_id, quantity, purchase_date)
           VALUES ($1, $2, $3, NOW())`,
                    [
                        userId,
                        ingredient.id,
                        ingredient.quantity_person_ingradient,
                    ],
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteIngredient(
        userId: string | number,
        ingredientId: string | number,
    ): Promise<boolean> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `DELETE FROM ingredient_purchases WHERE person_id = $1 AND ingredient_id = $2`,
                [userId, ingredientId],
            );

            const result = await client.query(
                `DELETE FROM person_ingredients WHERE person_id = $1 AND ingredient_id = $2`,
                [userId, ingredientId],
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");

                return false;
            }

            await client.query("COMMIT");

            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePurchaseQuantity(
        userId: string | number,
        purchaseId: string | number,
        quantity: number,
    ): Promise<boolean | null> {
        return updatePurchaseQuantity(this.pool, userId, purchaseId, quantity);
    }

    async findPurchaseHistory(
        userId: string | number,
        ingredientId: string | number,
    ): Promise<unknown[]> {
        return findIngredientPurchaseHistory(this.pool, userId, ingredientId);
    }
}
