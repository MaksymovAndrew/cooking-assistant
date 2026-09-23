import type { RecipeFilters } from "domain/repositories/recipe.filters";

import type { SqlFilterBuilder } from "infrastructure/persistence/pg/sqlFilterBuilder";

export const pantryFilterClause = {
    applies: (filters: RecipeFilters) => filters.in_pantry === true,
    apply: (
        builder: SqlFilterBuilder,
        _filters: RecipeFilters,
        context: { userId: number | null },
    ) => {
        // SearchRecipes already rejects in_pantry for a null (guest) requester before the query
        // is built - this re-check only narrows userId to number for the bind() call below
        const { userId } = context;

        if (userId === null) {
            return;
        }

        // a recipe qualifies only if the pantry covers every ingredient in sufficient quantity (ROUND avoids float noise, see PgPantryRepository.queries.ts); the second EXISTS rules out ingredient-less recipes, which would pass the NOT EXISTS trivially otherwise
        builder.add(
            (bind) => `NOT EXISTS (
        SELECT 1 FROM recipe_ingredients ri2
        LEFT JOIN person_ingredients pi
          ON pi.ingredient_id = ri2.ingredient_id AND pi.person_id = ${bind(userId)}
        WHERE ri2.recipe_id = r.id AND (pi.ingredient_id IS NULL
          OR ROUND(pi.quantity_person_ingradient::numeric, 3)
             < ROUND(ri2.quantity_recipe_ingredients::numeric, 3))
      )
      AND EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = r.id)`,
        );
    },
};
