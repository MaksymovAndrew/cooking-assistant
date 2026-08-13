import type { MenuWithStats } from "types/menu";

export interface AverageCookingTime {
    typeName: string;
    averageCookingTime: number;
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

export interface RecipeTimeEntry {
    id: number;
    title: string;
    cookingTime: number;
}

export interface RecipeIngredientCountEntry {
    id: number;
    title: string;
    ingredientCount: number;
}

export interface RecipeCalorieEntry {
    id: number;
    title: string;
    caloriesPerPortion: number;
}

// shape returned by GET /api/recipes-stats - computed server-side across every recipe, not just the current user's
export interface RecipeStatistics {
    stats: RecipeTypeStat[];
    recipesCount: number;
    averageCookingTimeOverall: number | null;
    averageCookingTimesByType: AverageCookingTime[];
    mostUsedType: RecipeTypeStat | null;
    fastestRecipes: RecipeTimeEntry[];
    slowestRecipes: RecipeTimeEntry[];
    mostIngredientsRecipes: RecipeIngredientCountEntry[];
    leastIngredientsRecipes: RecipeIngredientCountEntry[];
    averageCaloriesOverall: number | null;
    mostCaloricRecipes: RecipeCalorieEntry[];
    leastCaloricRecipes: RecipeCalorieEntry[];
}

export type MenuWithCalories = MenuWithStats & { total_calories: number };

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
    averageCaloriesOverall: number | null;
    mostCaloricMenus: MenuWithCalories[];
    leastCaloricMenus: MenuWithCalories[];
}
