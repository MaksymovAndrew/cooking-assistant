import { AlertCircle } from "lucide-react";
import React from "react";

import styles from "./FormErrorBanner.module.scss";

interface FormErrorBannerProps {
    message: string;
}

const ICON_SIZE = 15;

export const FormErrorBanner: React.FC<FormErrorBannerProps> = ({
    message,
}) => (
    <div className={styles["form-error-banner"]} role="alert">
        <AlertCircle size={ICON_SIZE} aria-hidden="true" />
        <span>{message}</span>
    </div>
);
