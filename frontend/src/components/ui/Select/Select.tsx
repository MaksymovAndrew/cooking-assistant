import { ChevronDown } from "lucide-react";
import React from "react";

import { useFormFieldAria } from "components/ui/FormField";

import { cx } from "utils/cx";

import styles from "./Select.module.scss";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

const CHEVRON_SIZE = 18;

export const Select: React.FC<SelectProps> = ({
    hasError = false,
    className,
    children,
    ...rest
}) => {
    const fieldAria = useFormFieldAria(rest);
    const classNames = cx(
        styles.select,
        hasError && styles["select--error"],
        className,
    );

    return (
        <div className={styles["select-wrapper"]}>
            <select className={classNames} {...rest} {...fieldAria}>
                {children}
            </select>
            <ChevronDown
                size={CHEVRON_SIZE}
                aria-hidden="true"
                className={styles["select-wrapper__chevron"]}
            />
        </div>
    );
};
