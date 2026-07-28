import { ChevronLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { IngredientCategoryOption } from "hooks/useIngredientCategories";

import styles from "./IngredientCategoryPanel.module.scss";

interface IngredientCategoryPanelProps {
    categories: IngredientCategoryOption[];
    activeCategory: string | null;
    onSelectCategory: (category: string) => void;
    onBack: () => void;
}

const BACK_ICON_SIZE = 15;

// the non-search dropdown content shared by the recipe ingredient picker and the pantry add-ingredient modal: a category browse list, or (once one is picked) a back header
export const IngredientCategoryPanel: React.FC<
    IngredientCategoryPanelProps
> = ({ categories, activeCategory, onSelectCategory, onBack }) => {
    const { t } = useTranslation("ingredients");
    const activeCategoryOption = categories.find(
        (category) => category.key === activeCategory,
    );

    if (activeCategoryOption) {
        return (
            <button
                type="button"
                onClick={onBack}
                aria-label={t("categoryBrowser.backTo", {
                    category: activeCategoryOption.label,
                })}
                className={styles["category-panel__back"]}
            >
                <ChevronLeft size={BACK_ICON_SIZE} aria-hidden="true" />
                {activeCategoryOption.label}
            </button>
        );
    }

    return (
        <ul className={styles["category-panel__categories"]}>
            {categories.map((category) => (
                <li key={category.key}>
                    <button
                        type="button"
                        onClick={() => {
                            onSelectCategory(category.key);
                        }}
                        className={styles["category-panel__category"]}
                    >
                        <span>{category.label}</span>
                        <span
                            className={styles["category-panel__category-count"]}
                        >
                            {category.count}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
};
