import type { Pool } from "pg";

import type {
    CookInput,
    CookRequirement,
    CookResult,
    CookSource,
    PantryConsumptionRepository,
    UndoCookingResult,
} from "domain/repositories/PantryConsumptionRepository";

import { cook } from "./PgPantryConsumptionRepository.cook";
import { findCookRequirements } from "./PgPantryConsumptionRepository.requirements";
import { undoCooking } from "./PgPantryConsumptionRepository.undo";

export default class PgPantryConsumptionRepository implements PantryConsumptionRepository {
    constructor(private pool: Pool) {}

    async findRequirements(source: CookSource): Promise<CookRequirement[]> {
        return findCookRequirements(this.pool, source);
    }

    async cook(personId: number, input: CookInput): Promise<CookResult> {
        return cook(this.pool, personId, input);
    }

    async undo(
        personId: number,
        consumptionId: number,
        windowMs: number,
    ): Promise<UndoCookingResult> {
        return undoCooking(this.pool, personId, consumptionId, windowMs);
    }
}
