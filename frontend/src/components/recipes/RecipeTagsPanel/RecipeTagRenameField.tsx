import { Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { TAG_LIMITS } from "constants/tags";
import type { Tag } from "types/tag";

import { TextInput } from "components/ui/TextInput";

import styles from "./RecipeTagsPanel.module.scss";

interface RecipeTagRenameFieldProps {
    tag: Tag;
    onSubmit: (name: string) => void;
    onCancel: () => void;
}

const ROW_ICON_SIZE = 14;

// its own component so the field can take focus on mount, where the row it replaces cannot
export const RecipeTagRenameField: React.FC<RecipeTagRenameFieldProps> = ({
    tag,
    onSubmit,
    onCancel,
}) => {
    const { t } = useTranslation("tags");
    const inputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(tag.name);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submit = () => {
        onSubmit(name.trim());
    };

    return (
        <>
            <TextInput
                ref={inputRef}
                value={name}
                maxLength={TAG_LIMITS.MAX_NAME_LENGTH}
                aria-label={t("editor.rename", { name: tag.name })}
                onChange={(event) => {
                    setName(event.target.value);
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        submit();
                    }
                    if (event.key === "Escape") {
                        onCancel();
                    }
                }}
            />
            <button
                type="button"
                className={styles["recipe-tags-panel__action"]}
                aria-label={t("editor.save")}
                onClick={submit}
            >
                <Check size={ROW_ICON_SIZE} aria-hidden="true" />
            </button>
        </>
    );
};
