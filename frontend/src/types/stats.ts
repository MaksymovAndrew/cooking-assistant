import type { MenuWithStats } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";

export interface AverageCookingTime {
    typeName: string;
    averageCookingTime: number;
}

export interface RecipesStatsResponse {
    averageCookingTimes: AverageCookingTime[] | null;
}

export interface MenuCategoryStat {
    categoryname: string;
    menuCount: number;
}

export interface RecipeTypeStat {
    typeName: string;
    count: number;
}

export interface AverageTimeByCategory {
    categoryname: string;
    averageTotalTime: number;
}

export interface RecipeStatistics {
    stats: RecipeTypeStat[];
    recipesCount: number;
    averageCookingTimeOverall: number | null;
    averageCookingTimesByType: AverageCookingTime[];
    mostUsedType: RecipeTypeStat | null;
    fastestRecipes: RecipeWithIngredientNames[];
    slowestRecipes: RecipeWithIngredientNames[];
    mostIngredientsRecipes: RecipeWithIngredientNames[];
    leastIngredientsRecipes: RecipeWithIngredientNames[];
}

export interface MenuStatistics {
    menusCount: number;
    menuCountByCategory: MenuCategoryStat[];
    mostUsedCategory: MenuCategoryStat | null;
    averageTotalTime: number | null;
    averageRecipesPerMenu: number | null;
    averageTotalTimeByCategory: AverageTimeByCategory[];
    fastestMenus: MenuWithStats[];
    slowestMenus: MenuWithStats[];
    mostRecipesMenus: MenuWithStats[];
    leastRecipesMenus: MenuWithStats[];
}
