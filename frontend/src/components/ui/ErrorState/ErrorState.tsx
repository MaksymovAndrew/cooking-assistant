import { RefreshCw, TriangleAlert } from "lucide-react";
import React from "react";

import { Button } from "components/ui/Button";

import styles from "./ErrorState.module.scss";

interface ErrorStateProps {
    title: string;
    description?: string;
    onRetry: () => void;
    retryLabel: string;
}

const ICON_SIZE = 32;
const RETRY_ICON_SIZE = 16;

export const ErrorState: React.FC<ErrorStateProps> = ({
    title,
    description,
    onRetry,
    retryLabel,
}) => (
    <div className={styles["error-state"]}>
        <span className={styles["error-state__icon"]}>
            <TriangleAlert size={ICON_SIZE} aria-hidden="true" />
        </span>
        <h2 className={styles["error-state__title"]}>{title}</h2>
        {description && (
            <p className={styles["error-state__description"]}>{description}</p>
        )}
        <Button variant="secondary" onClick={onRetry}>
            <RefreshCw size={RETRY_ICON_SIZE} aria-hidden="true" />
            {retryLabel}
        </Button>
    </div>
);
