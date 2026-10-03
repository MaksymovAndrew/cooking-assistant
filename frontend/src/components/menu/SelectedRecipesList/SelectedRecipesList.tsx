import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { useDragReorder } from "hooks/useDragReorder";

import { GripMark } from "components/icons";
import { MoveButtons } from "components/ui/MoveButtons";

import { recipeTypeLabel } from "utils/referenceLabels";

import styles from "./SelectedRecipesList.module.scss";

interface SelectedRecipesListProps {
    recipes: RecipeListItem[];
    onRemove: (id: number) => void;
    onReorder: (fromId: number, toId: number) => void;
}

const REMOVE_ICON_SIZE = 15;
const GRIP_ICON_SIZE = 16;

export const SelectedRecipesList: React.FC<SelectedRecipesListProps> = ({
    recipes,
    onRemove,
    onReorder,
}) => {
    const { t } = useTranslation();
    const { dragProps, move } = useDragReorder(
        recipes.map((recipe) => recipe.id),
        onReorder,
    );

    return (
        <div className={styles["selected-recipes-list"]}>
            {recipes.map((recipe, index) => (
                <div
                    key={recipe.id}
                    {...dragProps(recipe.id)}
                    className={styles["selected-recipes-list__row"]}
                >
                    <GripMark
                        size={GRIP_ICON_SIZE}
                        className={styles["selected-recipes-list__grip"]}
                    />
                    <span className={styles["selected-recipes-list__name"]}>
                        {recipe.title}
                    </span>
                    <div className={styles["selected-recipes-list__controls"]}>
                        <span className={styles["selected-recipes-list__type"]}>
                            {recipeTypeLabel(t, recipe.type_name)}
                        </span>
                        <MoveButtons
                            name={recipe.title}
                            isFirst={index === 0}
                            isLast={index === recipes.length - 1}
                            onMove={(direction) => {
                                move(recipe.id, direction);
                            }}
                        />
                        <button
                            type="button"
                            aria-label={t("chip.remove", {
                                name: recipe.title,
                            })}
                            onClick={() => {
                                onRemove(recipe.id);
                            }}
                            className={styles["selected-recipes-list__remove"]}
                        >
                            <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
