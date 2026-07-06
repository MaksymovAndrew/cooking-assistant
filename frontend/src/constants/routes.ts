export const ROUTES = {
    home: "/",
    login: "/login",
    registration: "/registration",

    allRecipes: "/all-recipes",
    myRecipes: "/my-recipes",
    addRecipe: "/add-recipe",
    recipeDetails: "/recipe/:id",
    changeRecipe: "/change-recipe/:id",

    ingredients: "/ingredients",
    stats: "/stats",

    allMenus: "/all-menus",
    myMenus: "/my-menus",
    addMenu: "/add-menu",
    menuDetails: "/menu/:id",
    changeMenu: "/change-menu/:id",

    profile: "/profile",
    settings: "/settings",

    notFound: "*",
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

export const PUBLIC_PATHS: string[] = [ROUTES.login, ROUTES.registration];
