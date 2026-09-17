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

// deep-links into the Dietary tab of the profile page - kept in sync with the "dietary" tab id read in useProfilePage.ts
export const profileDietaryPath = (): string => `${ROUTES.profile}?tab=dietary`;

// the sign-in flow itself: never a destination to return to after logging in
export const AUTH_PATHS: string[] = [
    ROUTES.login,
    ROUTES.registration,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    ROUTES.verifyEmail,
];

// route patterns (":id" and all), not literal paths - matched against the current location with
// matchRoutePattern, since a dynamic segment never equals its own pattern string
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

// crawler-facing form of the private area: a robots rule matches a path prefix, not a route
// pattern, so ":id" is dropped rather than matched literally
export const PRIVATE_PATH_PREFIXES: string[] = Object.values(ROUTES)
    .filter((path) => !PUBLIC_PATHS.includes(path))
    .map((path) => path.replace(":id", ""));
