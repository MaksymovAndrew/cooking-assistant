import { ROUTES } from "constants/routes";
import type { RecordAuthor } from "types/media";
import type { RecordRating } from "types/rating";

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

export const TEST_AUTHOR: RecordAuthor = {
    name: "Test",
    surname_initial: "U",
    avatar: null,
    avatar_photo_key: null,
};

export const TEST_UNRATED: RecordRating = {
    ratingAverage: null,
    ratingCount: 0,
    myRating: null,
};
