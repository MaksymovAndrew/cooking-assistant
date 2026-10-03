// ROUTES are router-relative: every router is mounted under API_PREFIX
export const API_PREFIX = "/api";

export const ROUTES = {
    health: "/health",

    auth: {
        register: "/register",
        login: "/login",
        logout: "/logout",
        me: "/me",
        locale: "/me/locale",
        avatar: "/me/avatar",
        forgotPassword: "/forgot-password",
        resetPassword: "/reset-password",
        changePassword: "/change-password",
        signOutEverywhere: "/sign-out-everywhere",
        resendVerificationEmail: "/resend-verification-email",
        confirmEmail: "/confirm-email",
    },

    recipes: {
        create: "/recipe",
        byId: "/recipe/:id",
        favourite: "/recipe/:id/favourite",
        photo: "/recipe/:id/photo",
        rating: "/recipe/:id/rating",
        tags: "/recipe/:id/tags",
        byFilters: "/recipes-by-filters",
        byPerson: "/recipes-filters-person",
        stats: "/recipes-stats",
    },

    recipeTypes: {
        list: "/recipe-types",
    },

    ingredients: {
        list: "/ingredients",
        avoid: "/ingredient/:id/avoid",
    },

    userIngredients: {
        list: "/user-ingredients",
        byIngredient: "/user-ingredients/:ingredientId",
        purchaseHistory: "/user-ingredients/history/:ingredientId",
        purchase: "/user-ingredients/history/:purchaseId",
        discard: "/user-ingredients/history/discard",
        cook: "/user-ingredients/cook",
        undoCook: "/user-ingredients/cook/:consumptionId/undo",
    },

    menu: {
        list: "/menu",
        stats: "/menus-stats",
        create: "/create-menu",
        byId: "/menu/:id",
        favourite: "/menu/:id/favourite",
        photo: "/menu/:id/photo",
        rating: "/menu/:id/rating",
        byPerson: "/menu-filters-person",
    },

    menuCategories: {
        list: "/menu-categories",
    },

    calories: {
        intake: "/calorie-intake",
        intakeById: "/calorie-intake/:intakeId",
        goal: "/calorie-goal",
    },

    dietPreferences: {
        get: "/diet-preferences",
        allergen: "/diet-preferences/allergens/:slug",
    },

    tags: {
        list: "/tags",
        byId: "/tags/:id",
    },

    media: {
        file: "/media/:file",
    },

    shoppingList: {
        list: "/shopping-list",
        byId: "/shopping-list/:id",
        checked: "/shopping-list/checked",
        order: "/shopping-list/order",
        ingredients: "/shopping-list/ingredients",
    },
} as const;

export const HEALTH_PATH = `${API_PREFIX}${ROUTES.health}`;

export const MEDIA_PATH_PREFIX = `${API_PREFIX}${ROUTES.media.file.replace(":file", "")}`;
