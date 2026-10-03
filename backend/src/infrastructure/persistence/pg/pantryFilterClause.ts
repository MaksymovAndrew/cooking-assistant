import type { RecipeFilters } from "domain/repositories/recipe.filters";

import type { ClauseContext } from "./filterClause";
import type { SqlFilterBuilder } from "./sqlFilterBuilder";

export const pantryFilterClause = {
    applies: (filters: RecipeFilters) => filters.in_pantry === true,
    apply: (
        builder: SqlFilterBuilder,
        _filters: RecipeFilters,
        context: ClauseContext,
    ) => {
        // guests are rejected before the query is built - this only narrows userId for bind()
        const { userId } = context;

        if (userId === null) {
            return;
        }

        // ROUND avoids float noise; the EXISTS keeps ingredient-less recipes from passing vacuously
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
