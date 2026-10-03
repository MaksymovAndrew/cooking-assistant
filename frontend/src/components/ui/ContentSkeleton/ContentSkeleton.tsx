import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./ContentSkeleton.module.scss";

interface ContentSkeletonProps {
    rows?: number;
}

const DEFAULT_ROWS = 4;
const ROW_WIDTHS = ["72%", "54%", "86%", "62%", "48%", "78%"];

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
    rows = DEFAULT_ROWS,
}) => {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            aria-label={t("contentSkeleton.loading")}
            className={styles["content-skeleton"]}
        >
            <span className={styles["content-skeleton__heading"]} />
            {Array.from({ length: rows }, (_, index) => (
                <span
                    key={index}
                    className={styles["content-skeleton__line"]}
                    style={{ width: ROW_WIDTHS[index % ROW_WIDTHS.length] }}
                />
            ))}
        </div>
    );
};
