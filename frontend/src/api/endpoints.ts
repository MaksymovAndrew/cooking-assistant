export const API_ROUTES = {
    auth: {
        login: "/api/login",
        register: "/api/register",
        logout: "/api/logout",
        me: "/api/me",
        avatar: "/api/me/avatar",
        locale: "/api/me/locale",
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
        favourite: (id: string | number) => `/api/recipe/${id}/favourite`,
        photo: (id: string | number) => `/api/recipe/${id}/photo`,
        rating: (id: string | number) => `/api/recipe/${id}/rating`,
        tags: (id: string | number) => `/api/recipe/${id}/tags`,
        stats: "/api/recipes-stats",
    },
    recipeTypes: {
        list: "/api/recipe-types",
    },
    ingredients: {
        list: "/api/ingredients",
        avoid: (id: string | number) => `/api/ingredient/${id}/avoid`,
    },
    userIngredients: {
        list: "/api/user-ingredients",
        item: (ingredientId: string | number) =>
            `/api/user-ingredients/${ingredientId}`,
        history: (id: string | number) => `/api/user-ingredients/history/${id}`,
    },
    menu: {
        list: "/api/menu",
        allUnpaginated: "/api/menus",
        create: "/api/create-menu",
        byId: (id: string | number) => `/api/menu/${id}`,
        favourite: (id: string | number) => `/api/menu/${id}/favourite`,
        photo: (id: string | number) => `/api/menu/${id}/photo`,
        rating: (id: string | number) => `/api/menu/${id}/rating`,
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
    dietPreferences: {
        get: "/api/diet-preferences",
        allergen: (slug: string) => `/api/diet-preferences/allergens/${slug}`,
    },
    tags: {
        list: "/api/tags",
        byId: (id: string | number) => `/api/tags/${id}`,
    },
    media: {
        file: (key: string, width: number) => `/api/media/${key}-${width}.webp`,
        social: (key: string) => `/api/media/${key}-og.jpg`,
    },
    shoppingList: {
        list: "/api/shopping-list",
        byId: (id: string | number) => `/api/shopping-list/${id}`,
        checked: "/api/shopping-list/checked",
        order: "/api/shopping-list/order",
        ingredients: "/api/shopping-list/ingredients",
    },
} as const;
