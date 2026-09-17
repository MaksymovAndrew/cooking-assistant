import { Info, Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";
import { TextInput } from "components/ui/TextInput";

import styles from "./ShoppingListAddForm.module.scss";

interface ShoppingListAddFormProps {
    onAdd: (name: string, note: string) => Promise<boolean>;
    isAdding: boolean;
}

// mirrors the server's limit, so an over-long entry can't be typed rather than being refused on save
const MAX_LENGTH = 120;
const PLUS_ICON_SIZE = 17;
const HINT_ICON_SIZE = 14;

export const ShoppingListAddForm: React.FC<ShoppingListAddFormProps> = ({
    onAdd,
    isAdding,
}) => {
    const { t } = useTranslation("shoppingList");
    const [name, setName] = useState("");
    const [note, setNote] = useState("");

    // Enter still submits while the button shows its loading state, so the form guards the repeat itself
    const submit = async () => {
        if (name.trim() === "" || isAdding) {
            return;
        }

        if (await onAdd(name, note)) {
            setName("");
            setNote("");
        }
    };

    return (
        <form
            className={styles["shopping-list-add-form"]}
            onSubmit={(e) => {
                e.preventDefault();
                submit().catch(() => undefined);
            }}
        >
            <div className={styles["shopping-list-add-form__fields"]}>
                <div className={styles["shopping-list-add-form__name"]}>
                    <Plus
                        size={PLUS_ICON_SIZE}
                        aria-hidden="true"
                        className={styles["shopping-list-add-form__name-icon"]}
                    />
                    <TextInput
                        aria-label={t("addForm.nameLabel")}
                        placeholder={t("addForm.namePlaceholder")}
                        value={name}
                        maxLength={MAX_LENGTH}
                        className={styles["shopping-list-add-form__name-input"]}
                        onChange={(event) => {
                            setName(event.target.value);
                        }}
                    />
                </div>
                <TextInput
                    aria-label={t("addForm.noteLabel")}
                    placeholder={t("addForm.notePlaceholder")}
                    value={note}
                    maxLength={MAX_LENGTH}
                    className={styles["shopping-list-add-form__note"]}
                    onChange={(event) => {
                        setNote(event.target.value);
                    }}
                />
                <Button
                    type="submit"
                    loading={isAdding}
                    disabled={name.trim() === ""}
                    className={styles["shopping-list-add-form__submit"]}
                >
                    {t("addForm.submit")}
                </Button>
            </div>
            <p className={styles["shopping-list-add-form__hint"]}>
                <Info size={HINT_ICON_SIZE} aria-hidden="true" />
                {t("addForm.hint")}
            </p>
        </form>
    );
};
