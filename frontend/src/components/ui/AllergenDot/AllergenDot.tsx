import React from "react";
import { useTranslation } from "react-i18next";

import { resolveAllergen } from "utils/ingredientName";

import styles from "./AllergenDot.module.scss";

interface AllergenDotProps {
    allergens: string[];
}

export const AllergenDot: React.FC<AllergenDotProps> = ({ allergens }) => {
    const { t } = useTranslation();

    if (allergens.length === 0) {
        return null;
    }

    return (
        <span
            title={allergens.map((slug) => resolveAllergen(t, slug)).join(", ")}
            className={styles["allergen-dot"]}
        />
    );
};
