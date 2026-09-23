import { Check } from "lucide-react";
import React from "react";

import styles from "./ShoppingListItemRow.module.scss";

interface ShoppingListCheckboxProps {
    id: string;
    checked: boolean;
    onChange: () => void;
}

const CHECK_ICON_SIZE = 14;

// a real checkbox stays in the tab order and the accessibility tree; the drawn box is decoration
export const ShoppingListCheckbox: React.FC<ShoppingListCheckboxProps> = ({
    id,
    checked,
    onChange,
}) => (
    <span className={styles["shopping-list-item-row__check"]}>
        <input
            id={id}
            type="checkbox"
            checked={checked}
            className={styles["shopping-list-item-row__input"]}
            onChange={onChange}
        />
        <span
            aria-hidden="true"
            className={styles["shopping-list-item-row__box"]}
        >
            <Check size={CHECK_ICON_SIZE} strokeWidth={3} />
        </span>
    </span>
);
