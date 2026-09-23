import React from "react";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

interface FilterSectionProps {
    label: string;
    children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
    label,
    children,
}) => (
    <div className={styles["recipe-filter-panel__section"]}>
        <span className={styles["recipe-filter-panel__label"]}>{label}</span>
        {children}
    </div>
);
