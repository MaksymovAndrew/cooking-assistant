export interface AverageCookingTime {
    typeName: string;
    averageCookingTime: number;
}

export interface MenuCategoryStat {
    categoryName: string;
    menuCount: number;
}

export interface RecipeTypeStat {
    typeName: string;
    count: number;
}

// typeName null gathers the recipes without a type, so the buckets add up to recipesCount
export interface RecipeTypeBucket {
    typeName: string | null;
    count: number;
}

export interface AverageTimeByCategory {
    categoryName: string;
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

// across every recipe, not just the viewer's
export interface RecipeStatistics {
    stats: RecipeTypeBucket[];
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

export interface MenuStatsEntry {
    id: number;
    title: string;
    categoryName: string;
    recipe_count: number;
    total_cooking_time: number;
    // null once any of the menu's recipes has no calories
    total_calories: number | null;
}

export type MenuWithCalories = MenuStatsEntry & { total_calories: number };

// across every menu, not just the viewer's
export interface MenuStatistics {
    menusCount: number;
    menuCountByCategory: MenuCategoryStat[];
    mostUsedCategory: MenuCategoryStat | null;
    averageTotalTime: number | null;
    averageRecipesPerMenu: number | null;
    averageTotalTimeByCategory: AverageTimeByCategory[];
    fastestMenus: MenuStatsEntry[];
    slowestMenus: MenuStatsEntry[];
    mostRecipesMenus: MenuStatsEntry[];
    leastRecipesMenus: MenuStatsEntry[];
    averageCaloriesOverall: number | null;
    mostCaloricMenus: MenuWithCalories[];
    leastCaloricMenus: MenuWithCalories[];
}
