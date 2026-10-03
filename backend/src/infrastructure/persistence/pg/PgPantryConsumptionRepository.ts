import type { Pool } from "pg";

import type {
    CookInput,
    CookRequirement,
    CookResult,
    PantryConsumptionRepository,
    UndoCookingResult,
} from "domain/repositories/PantryConsumptionRepository";
import type { RecordSource } from "domain/repositories/recordSource";

import { cook } from "./PgPantryConsumptionRepository.cook";
import { findCookRequirements } from "./PgPantryConsumptionRepository.requirements";
import { undoCooking } from "./PgPantryConsumptionRepository.undo";

export default class PgPantryConsumptionRepository implements PantryConsumptionRepository {
    constructor(private pool: Pool) {}

    async findRequirements(source: RecordSource): Promise<CookRequirement[]> {
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
