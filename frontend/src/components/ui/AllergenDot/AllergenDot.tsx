import React from "react";

import { resolveAllergen } from "utils/ingredientName";

import styles from "./AllergenDot.module.scss";

interface AllergenDotProps {
    allergens: string[];
}

export const AllergenDot: React.FC<AllergenDotProps> = ({ allergens }) => {
    if (allergens.length === 0) {
        return null;
    }

    return (
        <span
            title={allergens.map(resolveAllergen).join(", ")}
            className={styles["allergen-dot"]}
        />
    );
};
