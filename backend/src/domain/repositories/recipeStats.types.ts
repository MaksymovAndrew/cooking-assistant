export interface RecipeTypeStat {
    typeName: string;
    count: number;
}

export interface AverageCookingTime {
    typeName: string;
    averageCookingTime: number;
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

export interface RecipeStatisticsDto {
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
