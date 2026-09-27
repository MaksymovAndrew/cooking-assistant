import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuCategory } from "types/menu";

import type { useMenuForm } from "hooks/useMenuForm";

import { ContentLanguageSelect } from "components/forms/ContentLanguageSelect";
import { FormPhotoCard } from "components/forms/FormPhotoCard";
import { MenuCategorySelect } from "components/menu/MenuCategorySelect";
import { FormCard } from "components/ui/FormCard";
import { FormField } from "components/ui/FormField";
import { Textarea } from "components/ui/Textarea";
import { TextInput } from "components/ui/TextInput";

import styles from "./MenuForm.module.scss";

type MenuPageKey = "createMenuPage" | "changeMenuPage";

interface MenuFormFieldsProps {
    form: ReturnType<typeof useMenuForm>;
    categories: MenuCategory[];
    keyPrefix: MenuPageKey;
    idPrefix: string;
}

export const MenuFormFields: React.FC<MenuFormFieldsProps> = ({
    form,
    categories,
    keyPrefix,
    idPrefix,
}) => {
    const { t } = useTranslation("menu");

    return (
        <>
            <FormPhotoCard
                photo={form.photo}
                title={t("menuForm.photoTitle")}
                alt={t("menuForm.photoAlt")}
            />

            <FormCard>
                <FormField
                    htmlFor={`${idPrefix}-title`}
                    label={t(`${keyPrefix}.titleLabel`)}
                    error={form.errors.menuTitleError}
                >
                    <TextInput
                        id={`${idPrefix}-title`}
                        value={form.menuTitle}
                        hasError={Boolean(form.errors.menuTitleError)}
                        onChange={(e) => {
                            form.setMenuTitle(e.target.value);
                        }}
                    />
                </FormField>
            </FormCard>

            <FormCard>
                <div className={styles["menu-form__pair-row"]}>
                    <MenuCategorySelect
                        id={`${idPrefix}-category`}
                        label={t(`${keyPrefix}.categoryLabel`)}
                        placeholder={t(`${keyPrefix}.categoryPlaceholder`)}
                        categories={categories}
                        value={form.selectedCategory}
                        error={form.errors.categoryError}
                        onChange={form.setSelectedCategory}
                    />
                    <ContentLanguageSelect
                        id={`${idPrefix}-language`}
                        label={t("menuForm.languageLabel")}
                        value={form.language}
                        onChange={form.setLanguage}
                    />
                </div>
            </FormCard>

            <FormCard>
                <FormField
                    htmlFor={`${idPrefix}-description`}
                    label={t(`${keyPrefix}.descriptionLabel`)}
                    error={form.errors.menuDescriptionError}
                >
                    <Textarea
                        id={`${idPrefix}-description`}
                        rows={4}
                        value={form.menuDescription}
                        hasError={Boolean(form.errors.menuDescriptionError)}
                        onChange={(e) => {
                            form.setMenuDescription(e.target.value);
                        }}
                    />
                </FormField>
            </FormCard>
        </>
    );
};
