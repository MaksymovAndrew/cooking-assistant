import React from "react";

import styles from "./AllergenDot.module.scss";

interface AllergenDotProps {
    allergens: string[];
}

export const AllergenDot: React.FC<AllergenDotProps> = ({ allergens }) => {
    if (allergens.length === 0) {
        return null;
    }

    return (
        <span title={allergens.join(", ")} className={styles["allergen-dot"]} />
    );
};
