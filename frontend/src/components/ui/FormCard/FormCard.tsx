import React from "react";

import styles from "./FormCard.module.scss";

interface FormCardProps {
    children: React.ReactNode;
    className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({ children, className }) => (
    <div className={[styles["form-card"], className].filter(Boolean).join(" ")}>
        {children}
    </div>
);
