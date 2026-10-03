export function caloriesPerPortion(recipeAlias: string): string {
    return `COALESCE(${recipeAlias}.calories_override, ${recipeAlias}.calories_computed)`;
}

// NULL once any recipe lacks calories: an undercounted total would mislead
export function menuCaloriesTotal(recipeAlias: string): string {
    const perPortion = caloriesPerPortion(recipeAlias);

    return `CASE
          WHEN bool_or(${recipeAlias}.id IS NOT NULL AND ${perPortion} IS NULL) THEN NULL
          ELSE SUM(${perPortion})
        END`;
}

export function computedRecipeCalories(recipeIdExpression: string): string {
    return `(
             SELECT SUM(ri.quantity_recipe_ingredients * i.calories_per_unit)
             FROM recipe_ingredients ri
                      JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = ${recipeIdExpression}
         )`;
}
