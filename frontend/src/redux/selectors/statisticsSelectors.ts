import { createSelector } from "@reduxjs/toolkit";

import type { MenuWithStats } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";

import { menusApi } from "redux/services/menusApi";
import { recipesApi } from "redux/services/recipesApi";

import { computeMenuStatistics } from "./computeMenuStatistics";
import { computeRecipeStatistics } from "./computeRecipeStatistics";

// no-arg list caches the stats page also subscribes to via the query hooks
const selectAllRecipesResult = recipesApi.endpoints.getAllRecipes.select(null);
const selectMenusResult = menusApi.endpoints.getAllMenus.select(null);

const selectAllRecipes = createSelector(
    selectAllRecipesResult,
    (result): RecipeWithIngredientNames[] => result.data ?? [],
);

const selectAllMenus = createSelector(
    selectMenusResult,
    (result): MenuWithStats[] => result.data ?? [],
);

export const selectRecipeStatistics = createSelector(
    selectAllRecipes,
    computeRecipeStatistics,
);

export const selectMenuStatistics = createSelector(
    selectAllMenus,
    computeMenuStatistics,
);
