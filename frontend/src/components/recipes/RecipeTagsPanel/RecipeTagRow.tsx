import { Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Tag } from "types/tag";

import { useAppDispatch } from "redux/hooks";
import { useRenameTagMutation } from "redux/services/tagsApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { RecipeTagRenameField } from "./RecipeTagRenameField";
import styles from "./RecipeTagsPanel.module.scss";

interface RecipeTagRowProps {
    tag: Tag;
    isSelected: boolean;
    onToggle: (tagId: number) => void;
}

const ROW_ICON_SIZE = 14;

// a failed rename is toasted by the global listener, and the row falls back to the stored name
const ignoreRejection = () => undefined;

export const RecipeTagRow: React.FC<RecipeTagRowProps> = ({
    tag,
    isSelected,
    onToggle,
}) => {
    const { t } = useTranslation("tags");
    const dispatch = useAppDispatch();
    const [renameTag] = useRenameTagMutation();
    const [isRenaming, setIsRenaming] = useState(false);

    const submitRename = (name: string) => {
        setIsRenaming(false);

        if (name === "" || name === tag.name) {
            return;
        }

        renameTag({ id: tag.id, name }).unwrap().catch(ignoreRejection);
    };

    if (isRenaming) {
        return (
            <li className={styles["recipe-tags-panel__row"]}>
                <RecipeTagRenameField
                    tag={tag}
                    onSubmit={submitRename}
                    onCancel={() => {
                        setIsRenaming(false);
                    }}
                />
            </li>
        );
    }

    return (
        <li className={styles["recipe-tags-panel__row"]}>
            <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                className={[
                    styles["recipe-tags-panel__toggle"],
                    isSelected && styles["recipe-tags-panel__toggle--on"],
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={() => {
                    onToggle(tag.id);
                }}
            >
                {isSelected && (
                    <Check size={ROW_ICON_SIZE} aria-hidden="true" />
                )}
                {tag.name}
            </button>
            <button
                type="button"
                className={styles["recipe-tags-panel__action"]}
                aria-label={t("editor.rename", { name: tag.name })}
                onClick={() => {
                    setIsRenaming(true);
                }}
            >
                <Pencil size={ROW_ICON_SIZE} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={styles["recipe-tags-panel__action"]}
                aria-label={t("editor.delete", { name: tag.name })}
                onClick={() => {
                    dispatch(
                        openModal({
                            type: MODAL_TYPE.deleteTag,
                            tagId: tag.id,
                            tagName: tag.name,
                        }),
                    );
                }}
            >
                <Trash2 size={ROW_ICON_SIZE} aria-hidden="true" />
            </button>
        </li>
    );
};
