import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PaginatedResult } from "domain/repositories/pagination.types";

import { menuFiltersSchema } from "application/validation/menu.schemas";
import { validate } from "application/validation/validate";

export default class GetAllMenus {
    constructor(private menuRepository: Pick<MenuRepository, "findAll">) {}

    async execute(
        userId: number | null,
        filters: unknown,
    ): Promise<PaginatedResult<unknown>> {
        const validFilters = validate(menuFiltersSchema, filters);

        if (userId === null && validFilters.favourites) {
            throw new ValidationError(ERROR_CODES.FAVOURITES_REQUIRES_LOGIN);
        }

        return this.menuRepository.findAll(validFilters, userId);
    }
}
