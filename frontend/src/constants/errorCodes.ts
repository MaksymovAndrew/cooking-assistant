// mirrors backend/src/constants/errorCodes.ts one to one - a backend test fails the build if the two drift apart
export const ERROR_CODES = {
    BAD_REQUEST: "bad_request",
    NOT_FOUND: "not_found",
    SERVER_ERROR: "server_error",
    VALIDATION_ERROR: "validation_error",
    RATE_LIMITED: "rate_limited",

    SESSION_EXPIRED: "auth/session_expired",
    USER_NOT_FOUND: "auth/user_not_found",
    LOGIN_ALREADY_TAKEN: "auth/login_already_taken",
    EMAIL_ALREADY_TAKEN: "auth/email_already_taken",
    INVALID_LOGIN_OR_PASSWORD: "auth/invalid_login_or_password",
    CURRENT_PASSWORD_INCORRECT: "auth/current_password_incorrect",
    INVALID_OR_EXPIRED_TOKEN: "auth/invalid_or_expired_token",
    EMAIL_ALREADY_VERIFIED: "auth/email_already_verified",
    NEW_PASSWORD_SAME_AS_CURRENT: "auth/new_password_same_as_current",

    RECIPE_NOT_FOUND: "recipe/not_found",
    RECIPE_INGREDIENTS_EMPTY: "recipe/ingredients_empty",
    RECIPE_INGREDIENTS_NO_ID: "recipe/ingredients_missing_id",
    RECIPE_INGREDIENTS_NOT_EXIST: "recipe/ingredients_not_exist",
    RECIPE_TITLE_CONTENT_EMPTY: "recipe/title_content_empty",
    RECIPE_IN_PANTRY_REQUIRES_LOGIN: "recipe/in_pantry_requires_login",

    MENU_NOT_FOUND: "menu/not_found",
    MENU_INSUFFICIENT_DATA_CREATE: "menu/insufficient_data_create",
    MENU_INSUFFICIENT_DATA_UPDATE: "menu/insufficient_data_update",
    MENU_RECIPES_NOT_EXIST: "menu/recipes_not_exist",

    INGREDIENT_NOT_FOUND_FOR_USER: "pantry/ingredient_not_found",
    PURCHASE_NOT_FOUND: "pantry/purchase_not_found",

    INTAKE_NOT_FOUND: "calories/intake_not_found",
    CALORIES_NOT_AVAILABLE: "calories/not_available",

    FAVOURITES_REQUIRES_LOGIN: "favourites/requires_login",

    INGREDIENT_NOT_FOUND: "ingredient/not_found",
    DIET_REQUIRES_LOGIN: "diet/requires_login",

    TAG_NOT_FOUND: "tags/not_found",
    TAG_DUPLICATE_NAME: "tags/duplicate_name",
    TAG_LIMIT_REACHED: "tags/limit_reached",
    TAGS_REQUIRES_LOGIN: "tags/requires_login",

    SHOPPING_LIST_ITEM_NOT_FOUND: "shopping_list/item_not_found",
    SHOPPING_LIST_LIMIT_REACHED: "shopping_list/limit_reached",
    SHOPPING_LIST_ORDER_OUT_OF_DATE: "shopping_list/order_out_of_date",

    MEDIA_UNSUPPORTED_TYPE: "media/unsupported_type",
    MEDIA_UNREADABLE: "media/unreadable",
    MEDIA_TOO_LARGE: "media/too_large",
    MEDIA_NOT_FOUND: "media/not_found",
} as const;
