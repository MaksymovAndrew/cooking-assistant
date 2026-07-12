import React from "react";

import styles from "./AllergenDot.module.scss";

interface AllergenDotProps {
    allergens: string | null | undefined;
}

export const AllergenDot: React.FC<AllergenDotProps> = ({ allergens }) => {
    if (!allergens) {
        return null;
    }

    return <span title={allergens} className={styles["allergen-dot"]} />;
};
