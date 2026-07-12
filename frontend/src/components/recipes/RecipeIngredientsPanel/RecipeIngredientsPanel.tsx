import { Check } from "lucide-react";
import React from "react";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { RecipeIngredientsBanner } from "./RecipeIngredientsBanner";
import { RecipeIngredientsHeader } from "./RecipeIngredientsHeader";
import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsPanelProps {
    availability: IngredientAvailability[];
    haveCount: number;
    missingCount: number;
    isOwner: boolean;
    canScale: boolean;
    servingsCount: number | null;
    scaleFactor: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const CHECK_ICON_SIZE = 16;
const DECIMALS = 2;

const scaleQuantity = (quantity: number, scaleFactor: number) =>
    Number((quantity * scaleFactor).toFixed(DECIMALS));

export const RecipeIngredientsPanel: React.FC<RecipeIngredientsPanelProps> = ({
    availability,
    haveCount,
    missingCount,
    isOwner,
    canScale,
    servingsCount,
    scaleFactor,
    onIncrement,
    onDecrement,
}) => {
    const sorted = [...availability].sort((a, b) =>
        a.name.localeCompare(b.name),
    );

    return (
        <div className={styles["recipe-ingredients-panel"]}>
            <RecipeIngredientsHeader
                ingredientCount={availability.length}
                canScale={canScale}
                servingsCount={servingsCount}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
            />

            <ul className={styles["recipe-ingredients-panel__list"]}>
                {sorted.map((ingredient) => (
                    <li
                        key={ingredient.id}
                        className={[
                            styles["recipe-ingredients-panel__row"],
                            !ingredient.have &&
                                styles[
                                    "recipe-ingredients-panel__row--missing"
                                ],
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {ingredient.have ? (
                            <Check
                                size={CHECK_ICON_SIZE}
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__have-icon"
                                    ]
                                }
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__missing-dot"
                                    ]
                                }
                            />
                        )}
                        <span
                            className={styles["recipe-ingredients-panel__name"]}
                        >
                            {ingredient.name}
                        </span>
                        <span
                            className={styles["recipe-ingredients-panel__qty"]}
                        >
                            {scaleQuantity(
                                ingredient.quantity_recipe_ingredients,
                                scaleFactor,
                            )}{" "}
                            {ingredient.unit_name}
                        </span>
                    </li>
                ))}
            </ul>

            {missingCount > 0 && (
                <RecipeIngredientsBanner
                    isOwner={isOwner}
                    haveCount={haveCount}
                    totalCount={availability.length}
                    missingCount={missingCount}
                />
            )}
        </div>
    );
};
