import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { TAG_LIMITS } from "constants/tags";
import type { Tag } from "types/tag";

import { TextInput } from "components/ui/TextInput";

import { RecipeTagRow } from "./RecipeTagRow";
import styles from "./RecipeTagsPanel.module.scss";

interface RecipeTagEditorProps {
    tags: Tag[];
    selectedIds: number[];
    onToggle: (tagId: number) => void;
    onCreate: (name: string) => void;
}

const ADD_ICON_SIZE = 15;

export const RecipeTagEditor: React.FC<RecipeTagEditorProps> = ({
    tags,
    selectedIds,
    onToggle,
    onCreate,
}) => {
    const { t } = useTranslation("tags");
    const [name, setName] = useState("");
    const trimmedName = name.trim();

    const handleCreate = () => {
        if (trimmedName === "") {
            return;
        }

        onCreate(trimmedName);
        setName("");
    };

    return (
        <div className={styles["recipe-tags-panel__editor"]}>
            <div className={styles["recipe-tags-panel__create"]}>
                <TextInput
                    value={name}
                    maxLength={TAG_LIMITS.MAX_NAME_LENGTH}
                    placeholder={t("editor.newPlaceholder")}
                    aria-label={t("editor.newPlaceholder")}
                    onChange={(event) => {
                        setName(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleCreate();
                        }
                    }}
                />
                <button
                    type="button"
                    className={styles["recipe-tags-panel__add"]}
                    disabled={trimmedName === ""}
                    aria-label={t("editor.add")}
                    onClick={handleCreate}
                >
                    <Plus size={ADD_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>
            {tags.length > 0 ? (
                <ul
                    aria-label={t("editor.listLabel")}
                    className={styles["recipe-tags-panel__list"]}
                >
                    {tags.map((tag) => (
                        <RecipeTagRow
                            key={tag.id}
                            tag={tag}
                            isSelected={selectedIds.includes(tag.id)}
                            onToggle={onToggle}
                        />
                    ))}
                </ul>
            ) : (
                <p className={styles["recipe-tags-panel__empty"]}>
                    {t("editor.empty")}
                </p>
            )}
        </div>
    );
};
