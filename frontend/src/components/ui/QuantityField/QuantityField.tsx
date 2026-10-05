import React from "react";

import { NumberInput } from "components/ui/NumberInput";

import { cx } from "utils/cx";
import { joinDescribedBy } from "utils/fieldDescription";

import styles from "./QuantityField.module.scss";

interface QuantityFieldProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> {
    unit: string;
}

export const QuantityField = React.forwardRef<
    HTMLInputElement,
    QuantityFieldProps
>(
    (
        { unit, className, id, "aria-describedby": describedBy, ...inputProps },
        ref,
    ) => {
        const unitId = id ? `${id}-unit` : undefined;

        return (
            <div className={cx(styles["quantity-field"], className)}>
                <NumberInput
                    ref={ref}
                    id={id}
                    className={styles["quantity-field__input"]}
                    aria-describedby={joinDescribedBy(describedBy, unitId)}
                    {...inputProps}
                />
                <span id={unitId} className={styles["quantity-field__unit"]}>
                    {unit}
                </span>
            </div>
        );
    },
);

QuantityField.displayName = "QuantityField";
