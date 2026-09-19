"use client";

import { Tag as TagIcon } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Tag } from "types/tag";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useRecipeTags } from "hooks/useRecipeTags";

import { RecipeTagEditor } from "./RecipeTagEditor";
import styles from "./RecipeTagsPanel.module.scss";

interface RecipeTagsPanelProps {
    recipeId: number;
    tags: Tag[];
}

const TITLE_ICON_SIZE = 14;

// the viewer's private tags on this recipe; rendered only for a signed-in viewer, since the
// server sends null tags to a guest
export const RecipeTagsPanel: React.FC<RecipeTagsPanelProps> = ({
    recipeId,
    tags,
}) => {
    const { t } = useTranslation("tags");
    const isHydrated = useIsHydrated();
    const [isEditing, setIsEditing] = useState(false);
    const {
        tags: allTags,
        selectedIds,
        selectedTags,
        toggleTag,
        addTag,
    } = useRecipeTags(recipeId, tags);

    return (
        <div className={styles["recipe-tags-panel"]}>
            <div className={styles["recipe-tags-panel__head"]}>
                <TagIcon size={TITLE_ICON_SIZE} aria-hidden="true" />
                <span className={styles["recipe-tags-panel__label"]}>
                    {t("panel.title")}
                </span>
                <button
                    type="button"
                    className={styles["recipe-tags-panel__edit"]}
                    aria-expanded={isEditing}
                    disabled={!isHydrated}
                    onClick={() => {
                        setIsEditing((editing) => !editing);
                    }}
                >
                    {isEditing ? t("panel.done") : t("panel.edit")}
                </button>
            </div>
            {selectedTags.length > 0 ? (
                <ul className={styles["recipe-tags-panel__chips"]}>
                    {selectedTags.map((tag) => (
                        <li
                            key={tag.id}
                            className={styles["recipe-tags-panel__chip"]}
                        >
                            {tag.name}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles["recipe-tags-panel__empty"]}>
                    {t("panel.empty")}
                </p>
            )}
            {isEditing && (
                <RecipeTagEditor
                    tags={allTags}
                    selectedIds={selectedIds}
                    onToggle={toggleTag}
                    onCreate={addTag}
                />
            )}
        </div>
    );
};
