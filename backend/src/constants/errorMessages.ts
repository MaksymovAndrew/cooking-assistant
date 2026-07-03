export const ERROR_MESSAGES = {
    // auth
    INVALID_LOGIN_OR_PASSWORD: "Invalid login or password",
    SESSION_EXPIRED: "Session expired, please log in again",
    AUTHENTICATED_USER_MISSING: "Authenticated user is missing",
    JWT_NOT_CONFIGURED: "JWT secret is not configured",
    LOGIN_ALREADY_TAKEN: "Login already taken",
    USER_NOT_FOUND: "User not found",

    // recipes
    RECIPE_NOT_FOUND: "Recipe not found",
    RECIPE_INGREDIENTS_EMPTY: "Ingredients cannot be empty",
    RECIPE_INGREDIENTS_NO_ID: "All ingredients must have id",
    RECIPE_TITLE_CONTENT_EMPTY: "Title and content cannot be empty",

    // menus
    MENU_NOT_FOUND: "Menu not found",
    MENU_INSUFFICIENT_DATA_CREATE: "Insufficient data to create menu",
    MENU_INSUFFICIENT_DATA_UPDATE: "Insufficient data to update menu",
    MENU_RECIPES_NOT_EXIST: "One or more recipes do not exist",

    // pantry
    INGREDIENT_NOT_FOUND_FOR_USER: "Ingredient not found for this user",
    PURCHASE_NOT_FOUND: "Purchase not found.",

    // generic
    NOT_FOUND: "Not found",
    SERVER_ERROR: "Server error",
} as const;

export const SUCCESS_MESSAGES = {
    // auth
    LOGGED_IN: "Logged in",
    LOGGED_OUT: "Logged out",

    // recipes
    RECIPE_DELETED: "Recipe successfully deleted",

    // menus
    MENU_CREATED: "Menu created successfully",
    MENU_UPDATED: "Menu updated successfully",
    MENU_DELETED: "Menu deleted successfully",

    // pantry
    INGREDIENTS_UPDATED: "Ingredients updated successfully",
    INGREDIENT_DELETED: "Ingredient and its history successfully deleted",
    QUANTITIES_UPDATED: "Ingredient quantities and purchase history updated",
    PURCHASE_UPDATED: "Purchase quantity updated successfully.",
} as const;
