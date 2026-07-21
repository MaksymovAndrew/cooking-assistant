import React from "react";

import styles from "./NumberInput.module.scss";

interface NumberInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> {
    hasError?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ hasError = false, className, ...rest }, ref) => {
        const classNames = [
            styles["number-input"],
            hasError && styles["number-input--error"],
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <input ref={ref} type="number" className={classNames} {...rest} />
        );
    },
);

NumberInput.displayName = "NumberInput";
