import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import type { PhotoTarget } from "domain/repositories/PhotoRepository";

export const NOT_FOUND_BY_TARGET = {
    recipe: ERROR_CODES.RECIPE_NOT_FOUND,
    menu: ERROR_CODES.MENU_NOT_FOUND,
    avatar: ERROR_CODES.USER_NOT_FOUND,
} satisfies Record<PhotoTarget, ErrorCode>;
