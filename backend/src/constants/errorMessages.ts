export const ERROR_MESSAGES = {
    INVALID_LOGIN_OR_PASSWORD: "Invalid login or password",
    SESSION_EXPIRED: "Session expired, please log in again",
    AUTHENTICATED_USER_MISSING: "Authenticated user is missing",
    JWT_NOT_CONFIGURED: "JWT secret is not configured",
    LOGIN_ALREADY_TAKEN: "Login already taken",
    USER_NOT_FOUND: "User not found",

    RECIPE_NOT_FOUND: "Recipe not found",
    RECIPE_INGREDIENTS_EMPTY: "Ingredients cannot be empty",
    RECIPE_INGREDIENTS_NO_ID: "All ingredients must have id",
    RECIPE_TITLE_CONTENT_EMPTY: "Title and content cannot be empty",

    MENU_NOT_FOUND: "Menu not found",
    MENU_INSUFFICIENT_DATA_CREATE: "Insufficient data to create menu",
    MENU_INSUFFICIENT_DATA_UPDATE: "Insufficient data to update menu",
    MENU_RECIPES_NOT_EXIST: "One or more recipes do not exist",

    INGREDIENT_NOT_FOUND_FOR_USER: "Ingredient not found for this user",
    PURCHASE_NOT_FOUND: "Purchase not found.",

    EMAIL_ALREADY_TAKEN: "Email already taken",
    CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
    INVALID_OR_EXPIRED_TOKEN: "This link is invalid or has expired",
    EMAIL_ALREADY_VERIFIED: "Email is already verified",
    NEW_PASSWORD_SAME_AS_CURRENT:
        "New password must be different from your current password",

    NOT_FOUND: "Not found",
    SERVER_ERROR: "Server error",
} as const;

// lowercase/namespaced values, not a screaming-case echo of the key, so sonarjs doesn't mistake one for a hardcoded secret
export const ERROR_CODES = {
    LOGIN_ALREADY_TAKEN: "auth/login_already_taken",
    EMAIL_ALREADY_TAKEN: "auth/email_already_taken",
    INVALID_LOGIN_OR_PASSWORD: "auth/invalid_login_or_password",
    CURRENT_PASSWORD_INCORRECT: "auth/current_password_incorrect",
    INVALID_OR_EXPIRED_TOKEN: "auth/invalid_or_expired_token",
    EMAIL_ALREADY_VERIFIED: "auth/email_already_verified",
    NEW_PASSWORD_SAME_AS_CURRENT: "auth/new_password_same_as_current",
    VALIDATION_ERROR: "validation_error",
    RATE_LIMITED: "rate_limited",
} as const;

export const SUCCESS_MESSAGES = {
    REGISTERED: "Registered",
    LOGGED_IN: "Logged in",
    LOGGED_OUT: "Logged out",

    RECIPE_DELETED: "Recipe successfully deleted",

    MENU_CREATED: "Menu created successfully",
    MENU_UPDATED: "Menu updated successfully",
    MENU_DELETED: "Menu deleted successfully",

    INGREDIENTS_UPDATED: "Ingredients updated successfully",
    INGREDIENT_DELETED: "Ingredient and its history successfully deleted",
    QUANTITIES_UPDATED: "Ingredient quantities and purchase history updated",
    PURCHASE_UPDATED: "Purchase quantity updated successfully.",

    PASSWORD_RESET_EMAIL_SENT:
        "If an account with that email exists and is verified, a password reset link has been sent.",
    PASSWORD_RESET: "Password reset successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    ACCOUNT_DELETED: "Account deleted successfully",
    VERIFICATION_EMAIL_SENT: "Verification link sent",
    EMAIL_VERIFIED: "Email verified successfully",
} as const;
