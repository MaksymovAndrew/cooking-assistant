import React from "react";

import { useFormFieldAria } from "components/ui/FormField";

import { cx } from "utils/cx";

import styles from "./NumberInput.module.scss";

interface NumberInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> {
    hasError?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ hasError = false, className, ...rest }, ref) => {
        const fieldAria = useFormFieldAria(rest);
        const classNames = cx(
            styles["number-input"],
            hasError && styles["number-input--error"],
            className,
        );

        return (
            <input
                ref={ref}
                type="number"
                className={classNames}
                {...rest}
                {...fieldAria}
            />
        );
    },
);

NumberInput.displayName = "NumberInput";
