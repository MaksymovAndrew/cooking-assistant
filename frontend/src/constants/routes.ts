export const ROUTES = {
    home: "/",
    login: "/login",
    registration: "/registration",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",

    allRecipes: "/all-recipes",
    myRecipes: "/my-recipes",
    addRecipe: "/add-recipe",
    recipeDetails: "/recipe/:id",
    changeRecipe: "/change-recipe/:id",

    ingredients: "/ingredients",
    stats: "/stats",
    shoppingList: "/shopping-list",

    allMenus: "/all-menus",
    myMenus: "/my-menus",
    addMenu: "/add-menu",
    menuDetails: "/menu/:id",
    changeMenu: "/change-menu/:id",

    profile: "/profile",
    settings: "/settings",
} as const;

const withId = (pattern: string, id: string | number): string =>
    pattern.replace(":id", String(id));

export const recipeDetailsPath = (id: string | number): string =>
    withId(ROUTES.recipeDetails, id);

export const changeRecipePath = (id: string | number): string =>
    withId(ROUTES.changeRecipe, id);

export const menuDetailsPath = (id: string | number): string =>
    withId(ROUTES.menuDetails, id);

export const changeMenuPath = (id: string | number): string =>
    withId(ROUTES.changeMenu, id);

// keep "dietary" in sync with the tab id useProfilePage.ts reads
export const profileDietaryPath = (): string => `${ROUTES.profile}?tab=dietary`;

export const AUTH_PATHS: string[] = [
    ROUTES.login,
    ROUTES.registration,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    ROUTES.verifyEmail,
];

// opened from emailed one-time links, whose token must never be indexed
export const UNINDEXED_AUTH_PATHS: string[] = [
    ROUTES.resetPassword,
    ROUTES.verifyEmail,
];

// patterns, not paths: compare them through matchRoutePattern
export const PUBLIC_PATHS: string[] = [
    ROUTES.home,
    ROUTES.login,
    ROUTES.registration,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    ROUTES.verifyEmail,
    ROUTES.allRecipes,
    ROUTES.recipeDetails,
    ROUTES.allMenus,
    ROUTES.menuDetails,
];

// robots rules match path prefixes, not patterns, so ":id" is dropped
export const PRIVATE_PATH_PREFIXES: string[] = Object.values(ROUTES)
    .filter((path) => !PUBLIC_PATHS.includes(path))
    .map((path) => path.replace(":id", ""));
