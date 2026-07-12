import React from "react";

import styles from "./AllergenDot.module.scss";

interface AllergenDotProps {
    allergens: string | null | undefined;
}

// amber dot flagging an allergen-containing ingredient in a picker result row
export const AllergenDot: React.FC<AllergenDotProps> = ({ allergens }) => {
    if (!allergens) {
        return null;
    }

    return <span title={allergens} className={styles["allergen-dot"]} />;
};
