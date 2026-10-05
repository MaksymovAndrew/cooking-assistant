import React from "react";

import styles from "./LoadMore.module.scss";

interface LoadMoreProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    loadMoreLabel: string;
    loadingLabel: string;
    countLabel?: string;
    errorMessage?: string;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
    hasMore,
    isLoading,
    onLoadMore,
    loadMoreLabel,
    loadingLabel,
    countLabel,
    errorMessage,
}) => {
    const isEmpty = !hasMore && !countLabel && !errorMessage;

    if (isEmpty) {
        return null;
    }

    return (
        <div className={styles["load-more"]}>
            <div className={styles["load-more__row"]}>
                {countLabel && (
                    <p
                        aria-live="polite"
                        className={styles["load-more__count"]}
                    >
                        {countLabel}
                    </p>
                )}
                {hasMore && (
                    <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className={styles["load-more__button"]}
                    >
                        {isLoading && (
                            <span
                                role="status"
                                aria-label={loadingLabel}
                                className={styles["load-more__spinner"]}
                            />
                        )}
                        {loadMoreLabel}
                    </button>
                )}
            </div>
            {errorMessage && (
                <div className={styles["load-more__error"]}>{errorMessage}</div>
            )}
        </div>
    );
};
