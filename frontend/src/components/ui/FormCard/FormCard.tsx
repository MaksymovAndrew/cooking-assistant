import React from "react";

import { cx } from "utils/cx";

import styles from "./FormCard.module.scss";

interface FormCardProps {
    children: React.ReactNode;
    className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({ children, className }) => (
    <div className={cx(styles["form-card"], className)}>{children}</div>
);
