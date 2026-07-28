import { Search } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { IngredientCategoryOption } from "hooks/useIngredientCategories";

import { Select } from "components/ui/Select";

import styles from "./IngredientsToolbar.module.scss";

interface IngredientsToolbarProps {
    query: string;
    onQueryChange: (query: string) => void;
    expiringSoonCount: number;
    expiringSoonOnly: boolean;
    onToggleExpiringSoon: () => void;
    categories: IngredientCategoryOption[];
    categoryFilter: string | null;
    onCategoryFilterChange: (category: string | null) => void;
}

const SEARCH_ICON_SIZE = 17;

export const IngredientsToolbar: React.FC<IngredientsToolbarProps> = ({
    query,
    onQueryChange,
    expiringSoonCount,
    expiringSoonOnly,
    onToggleExpiringSoon,
    categories,
    categoryFilter,
    onCategoryFilterChange,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <div className={styles["ingredients-toolbar"]}>
            <div className={styles["ingredients-toolbar__search"]}>
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        onQueryChange(e.target.value);
                    }}
                    placeholder={t("page.searchPlaceholder")}
                    className={styles["ingredients-toolbar__search-input"]}
                />
            </div>
            {categories.length > 0 && (
                <Select
                    aria-label={t("page.categoryFilterLabel")}
                    value={categoryFilter ?? ""}
                    onChange={(e) => {
                        onCategoryFilterChange(e.target.value || null);
                    }}
                    className={styles["ingredients-toolbar__category-select"]}
                >
                    <option value="">{t("page.categoryFilterAll")}</option>
                    {categories.map((category) => (
                        <option key={category.key} value={category.key}>
                            {category.label} ({category.count})
                        </option>
                    ))}
                </Select>
            )}
            {expiringSoonCount > 0 && (
                <button
                    type="button"
                    onClick={onToggleExpiringSoon}
                    className={[
                        styles["ingredients-toolbar__filter-pill"],
                        expiringSoonOnly &&
                            styles["ingredients-toolbar__filter-pill--active"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {t("page.expiringSoonFilter", { count: expiringSoonCount })}
                </button>
            )}
        </div>
    );
};
