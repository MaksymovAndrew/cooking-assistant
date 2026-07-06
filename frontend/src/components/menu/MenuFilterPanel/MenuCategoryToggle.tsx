import React from "react";

import styles from "./MenuFilterPanel.module.scss";

interface MenuCategoryToggleProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
}

export const MenuCategoryToggle: React.FC<MenuCategoryToggleProps> = ({
    label,
    selected,
    onToggle,
}) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={label}
        onClick={onToggle}
        className={[
            styles["menu-filter-panel__category"],
            selected && styles["menu-filter-panel__category--selected"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        {label}
    </button>
);
