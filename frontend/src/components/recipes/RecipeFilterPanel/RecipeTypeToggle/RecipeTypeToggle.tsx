import React from "react";

import styles from "./RecipeTypeToggle.module.scss";

interface RecipeTypeToggleProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
}

export const RecipeTypeToggle: React.FC<RecipeTypeToggleProps> = ({
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
            styles["recipe-type-toggle"],
            selected && styles["recipe-type-toggle--selected"],
        ]
            .filter(Boolean)
            .join(" ")}
    >
        {label}
    </button>
);
