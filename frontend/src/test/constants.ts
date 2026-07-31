import { ROUTES } from "constants/routes";

// navigation route targets used in navigate() assertions, sourced from the app route constants so expectations can never drift from the real paths
export const ROUTE_HOME = ROUTES.home;
export const ROUTE_LOGIN = ROUTES.login;
export const ROUTE_ALL_RECIPES = ROUTES.allRecipes;
export const ROUTE_ALL_MENUS = ROUTES.allMenus;

export const LABEL_COOKING_TIME = "Cooking time *";

export const BTN_DELETE_RECIPE = "Delete recipe";
export const BTN_EDIT_RECIPE = "Edit recipe";

export const BTN_DELETE_MENU = "Delete menu";
export const BTN_EDIT_MENU = "Edit menu";

export const BTN_ADD_INGREDIENT = "Add ingredient";

export const ERROR_RECIPES_REQUIRED = "Please select at least one recipe.";
export const ERROR_COOKING_TIME_FORMAT = "Enter hours and minutes.";

export const MOCK_ERROR_SERVER = "Server error";
