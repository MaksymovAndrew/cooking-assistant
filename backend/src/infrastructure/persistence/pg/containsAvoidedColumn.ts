// true when any ingredient of the recipe is on the person's avoid list, directly or through one of its allergens
export function containsAvoidedCondition(
    recipeIdExpression: string,
    userPlaceholder: string,
): string {
    return `EXISTS (
        SELECT 1 FROM recipe_ingredients avoid_ri
        JOIN ingredients avoid_i ON avoid_i.id = avoid_ri.ingredient_id
        WHERE avoid_ri.recipe_id = ${recipeIdExpression}
          AND (
              EXISTS (
                  SELECT 1 FROM person_avoided_ingredients pai
                  WHERE pai.person_id = ${userPlaceholder}::int AND pai.ingredient_id = avoid_i.id
              )
              OR avoid_i.allergens && ARRAY(
                  SELECT paa.allergen FROM person_avoided_allergens paa
                  WHERE paa.person_id = ${userPlaceholder}::int
              )
          )
    )`;
}

// null for an anonymous requester, the same contract as isFavourite
export function containsAvoidedColumn(
    recipeIdExpression: string,
    userPlaceholder: string,
): string {
    const condition = containsAvoidedCondition(
        recipeIdExpression,
        userPlaceholder,
    );

    return `CASE WHEN ${userPlaceholder}::int IS NULL THEN NULL
                ELSE ${condition}
            END AS "containsAvoided"`;
}
