export const API_ROUTES = {
    auth: {
        login: "/api/login",
        register: "/api/register",
        logout: "/api/logout",
        me: "/api/me",
        forgotPassword: "/api/forgot-password",
        resetPassword: "/api/reset-password",
        changePassword: "/api/change-password",
        resendVerificationEmail: "/api/resend-verification-email",
        confirmEmail: "/api/confirm-email",
    },
    recipes: {
        list: "/api/recipes",
        byFilters: "/api/recipes-by-filters",
        byPerson: "/api/recipes-filters-person",
        create: "/api/recipe",
        byId: (id: string | number) => `/api/recipe/${id}`,
        stats: "/api/recipes-stats",
    },
    recipeTypes: {
        list: "/api/recipe-types",
    },
    ingredients: {
        list: "/api/ingredients",
    },
    userIngredients: {
        list: "/api/user-ingredients",
        updateQuantities: "/api/user-ingredients/update-quantities",
        item: (ingredientId: string | number) =>
            `/api/user-ingredients/${ingredientId}`,
        history: (id: string | number) => `/api/user-ingredients/history/${id}`,
    },
    menu: {
        list: "/api/menu",
        allUnpaginated: "/api/menus",
        create: "/api/create-menu",
        byId: (id: string | number) => `/api/menu/${id}`,
        byPerson: "/api/menu-filters-person",
    },
    menuCategories: {
        list: "/api/menu-categories",
    },
    calories: {
        intake: "/api/calorie-intake",
        intakeById: (id: string | number) => `/api/calorie-intake/${id}`,
        goal: "/api/calorie-goal",
    },
} as const;
