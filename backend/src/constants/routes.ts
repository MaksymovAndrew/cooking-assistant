// every path the API serves, in one place. Values are router-relative: each router is mounted
// under API_PREFIX in app.ts, so a full path is the prefix plus the value.
export const API_PREFIX = "/api";

export const ROUTES = {
    health: "/health",

    auth: {
        register: "/register",
        login: "/login",
        logout: "/logout",
        me: "/me",
        forgotPassword: "/forgot-password",
        resetPassword: "/reset-password",
        changePassword: "/change-password",
        resendVerificationEmail: "/resend-verification-email",
        confirmEmail: "/confirm-email",
    },

    recipes: {
        create: "/recipe",
        list: "/recipes",
        byId: "/recipe/:id",
        favourite: "/recipe/:id/favourite",
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
    },

    menu: {
        list: "/menu",
        allUnpaginated: "/menus",
        create: "/create-menu",
        byId: "/menu/:id",
        favourite: "/menu/:id/favourite",
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

    shoppingList: {
        list: "/shopping-list",
        byId: "/shopping-list/:id",
        checked: "/shopping-list/checked",
        order: "/shopping-list/order",
        ingredients: "/shopping-list/ingredients",
    },
} as const;

// the probe is the one path referenced outside its own router - request logging filters it out -
// so the mounted form is derived here rather than written a second time
export const HEALTH_PATH = `${API_PREFIX}${ROUTES.health}`;
