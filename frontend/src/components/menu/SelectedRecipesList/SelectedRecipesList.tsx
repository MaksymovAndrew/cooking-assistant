import { X } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { GripMark } from "components/icons";

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
    const [draggedId, setDraggedId] = useState<number | null>(null);

    return (
        <div className={styles["selected-recipes-list"]}>
            {recipes.map((recipe) => (
                <div
                    key={recipe.id}
                    draggable
                    onDragStart={() => {
                        setDraggedId(recipe.id);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();

                        if (draggedId !== null) {
                            onReorder(draggedId, recipe.id);
                        }

                        setDraggedId(null);
                    }}
                    onDragEnd={() => {
                        setDraggedId(null);
                    }}
                    className={styles["selected-recipes-list__row"]}
                >
                    <GripMark
                        size={GRIP_ICON_SIZE}
                        className={styles["selected-recipes-list__grip"]}
                    />
                    <span className={styles["selected-recipes-list__name"]}>
                        {recipe.title}
                    </span>
                    <span className={styles["selected-recipes-list__type"]}>
                        {recipe.type_name}
                    </span>
                    <button
                        type="button"
                        aria-label={t("chip.remove")}
                        onClick={() => {
                            onRemove(recipe.id);
                        }}
                        className={styles["selected-recipes-list__remove"]}
                    >
                        <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                    </button>
                </div>
            ))}
        </div>
    );
};
