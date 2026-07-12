import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { menuFiltersSchema } from "application/validation/menu.schemas";
import { validate } from "application/validation/validate";

export default class GetAllMenus {
    constructor(private menuRepository: Pick<MenuRepository, "findAll">) {}

    async execute(filters: unknown): Promise<PaginatedResult<unknown>> {
        const validFilters = validate(menuFiltersSchema, filters);

        return this.menuRepository.findAll(validFilters);
    }
}
