// a recipe's calories per portion: the author's own figure wins over the one computed from its ingredients
export function caloriesPerPortion(recipeAlias: string): string {
    return `COALESCE(${recipeAlias}.calories_override, ${recipeAlias}.calories_computed)`;
}

// a menu's calories, or NULL once any of its recipes has none - a silently undercounted total would mislead
export function menuCaloriesTotal(recipeAlias: string): string {
    const perPortion = caloriesPerPortion(recipeAlias);

    return `CASE
          WHEN bool_or(${recipeAlias}.id IS NOT NULL AND ${perPortion} IS NULL) THEN NULL
          ELSE SUM(${perPortion})
        END`;
}

// a recipe's calories summed from its ingredients and the catalog's per-unit values
export function computedRecipeCalories(recipeIdExpression: string): string {
    return `(
             SELECT SUM(ri.quantity_recipe_ingredients * i.calories_per_unit)
             FROM recipe_ingredients ri
                      JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = ${recipeIdExpression}
         )`;
}
