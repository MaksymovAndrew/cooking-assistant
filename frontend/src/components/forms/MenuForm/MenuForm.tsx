import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { MenuCategory } from "types/menu";
import type { RecipeListItem } from "types/recipe";

import type { useMenuForm } from "hooks/useMenuForm";

import { MenuCategorySelect } from "components/menu/MenuCategorySelect";
import { RecipePicker } from "components/menu/RecipePicker";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { Textarea } from "components/ui/Textarea";
import { TextInput } from "components/ui/TextInput";

import styles from "./MenuForm.module.scss";

type MenuPageKey = "createMenuPage" | "changeMenuPage";

interface MenuFormProps {
    form: ReturnType<typeof useMenuForm>;
    categories: MenuCategory[];
    allRecipes: RecipeListItem[];
    keyPrefix: MenuPageKey;
    idPrefix: string;
    submitLabel: string;
    onSubmit: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({
    form,
    categories,
    allRecipes,
    keyPrefix,
    idPrefix,
    submitLabel,
    onSubmit,
}) => {
    const { t } = useTranslation("menu");
    const selectedRecipes = allRecipes.filter((recipe) =>
        form.selectedRecipes.includes(recipe.id),
    );

    return (
        <form className={styles["menu-form"]}>
            <FormField
                htmlFor={`${idPrefix}-title`}
                label={t(`${keyPrefix}.titleLabel`)}
                error={form.errors.menuTitleError}
            >
                <TextInput
                    id={`${idPrefix}-title`}
                    value={form.menuTitle}
                    onChange={(e) => {
                        form.setMenuTitle(e.target.value);
                    }}
                />
            </FormField>
            <FormField
                htmlFor={`${idPrefix}-description`}
                label={t(`${keyPrefix}.descriptionLabel`)}
                error={form.errors.menuDescriptionError}
            >
                <Textarea
                    id={`${idPrefix}-description`}
                    rows={4}
                    value={form.menuDescription}
                    onChange={(e) => {
                        form.setMenuDescription(e.target.value);
                    }}
                />
            </FormField>
            <MenuCategorySelect
                id={`${idPrefix}-category`}
                label={t(`${keyPrefix}.categoryLabel`)}
                placeholder={t(`${keyPrefix}.categoryPlaceholder`)}
                categories={categories}
                value={form.selectedCategory}
                error={form.errors.categoryError}
                onChange={form.setSelectedCategory}
            />
            <RecipePicker
                allRecipes={allRecipes}
                selectedIds={form.selectedRecipes}
                label={t(`${keyPrefix}.recipesLabel`)}
                onToggle={(recipe) => {
                    form.toggleRecipeSelection(recipe.id);
                }}
            />
            {selectedRecipes.length > 0 && (
                <div className={styles["menu-form__selected"]}>
                    <h4 className={styles["menu-form__selected-heading"]}>
                        {t(`${keyPrefix}.selectedRecipes`)}
                    </h4>
                    <div className={styles["menu-form__selected-chips"]}>
                        {selectedRecipes.map((recipe) => (
                            <Chip
                                key={recipe.id}
                                removable
                                onRemove={() => {
                                    form.toggleRecipeSelection(recipe.id);
                                }}
                            >
                                {recipe.title}
                            </Chip>
                        ))}
                    </div>
                </div>
            )}
            {form.errors.recipesError && (
                <FormErrorBanner message={form.errors.recipesError} />
            )}
            <div className={styles["menu-form__save-panel"]}>
                <Link
                    to={ROUTES.allMenus}
                    className={styles["menu-form__cancel"]}
                >
                    {t("menuForm.cancel")}
                </Link>
                <Button type="button" onClick={onSubmit}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};
